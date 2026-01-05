package com.voyageconnect.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.voyageconnect.dto.FlightDTO;
import com.voyageconnect.dto.HotelDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@Slf4j
public class AmadeusClientService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final AmadeusAuthService authService;

    private static final String AMADEUS_API_URL = "https://test.api.amadeus.com/v2";

    public AmadeusClientService(RestTemplate restTemplate, ObjectMapper objectMapper, AmadeusAuthService authService) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
        this.authService = authService;
    }

    /**
     * Search destinations by keyword (city name, IATA code, etc.)
     * Includes fallback for Moroccan cities to ensure they appear in results
     */
    public List<Map<String, Object>> searchDestinations(String keyword) {
        try {
            String accessToken = authService.getAccessToken();
            String encodedKeyword = URLEncoder.encode(keyword, StandardCharsets.UTF_8);
            // Using v1 API for destinations (not v2)
            String url = String.format("https://test.api.amadeus.com/v1/reference-data/locations?subType=CITY&keyword=%s", encodedKeyword);

            HttpHeaders headers = createAuthHeaders(accessToken);
            HttpEntity<String> entity = new HttpEntity<>(headers);

            log.info("✓ Got valid access token, searching Amadeus destinations");
            log.info("  Searching for: {}", keyword);
            log.info("  URL: {}", url);
            String response = restTemplate.exchange(url, org.springframework.http.HttpMethod.GET, entity, String.class).getBody();
            
            if (response == null || response.isEmpty()) {
                log.error("✗ Amadeus API returned empty response for destinations");
                return getMoroccanCityFallback(keyword);
            }
            
            JsonNode jsonNode = objectMapper.readTree(response);
            JsonNode data = jsonNode.get("data");

            List<Map<String, Object>> destinations = new ArrayList<>();
            if (data != null && data.isArray()) {
                data.forEach(item -> {
                    Map<String, Object> dest = new HashMap<>();
                    dest.put("id", item.get("id").asText());
                    dest.put("name", item.get("name").asText());
                    dest.put("iataCode", item.has("iataCode") ? item.get("iataCode").asText() : "");
                    dest.put("country", item.has("address") && item.get("address").has("countryName") ? 
                        item.get("address").get("countryName").asText() : "");
                    destinations.add(dest);
                    
                    // Log each destination for debugging
                    log.debug("  → {} ({}) - {}", dest.get("name"), dest.get("iataCode"), dest.get("country"));
                });
            }

            log.info("Found {} destinations for keyword '{}' from Amadeus API", destinations.size(), keyword);
            
            // If no Moroccan cities found but keyword matches a Moroccan city, add fallback
            boolean hasMoroccanCity = destinations.stream()
                .anyMatch(d -> "Morocco".equalsIgnoreCase(d.get("country").toString()));
            
            if (!hasMoroccanCity) {
                List<Map<String, Object>> fallback = getMoroccanCityFallback(keyword);
                if (!fallback.isEmpty()) {
                    log.info("  Adding {} Moroccan city fallback(s) for keyword '{}'", fallback.size(), keyword);
                    destinations.addAll(0, fallback); // Add at beginning
                }
            }
            
            return destinations;

        } catch (Exception e) {
            log.error("✗ Error searching destinations from Amadeus: {}", e.getMessage());
            log.debug("Full exception", e);
            // Return Moroccan city fallback if API fails
            return getMoroccanCityFallback(keyword);
        }
    }

    /**
     * Fallback for Moroccan cities when Amadeus API doesn't return them
     * Matches keyword against known Moroccan cities and IATA codes
     */
    private List<Map<String, Object>> getMoroccanCityFallback(String keyword) {
        if (keyword == null || keyword.length() < 2) {
            return new ArrayList<>();
        }
        
        String lowerKeyword = keyword.toLowerCase().trim();
        List<Map<String, Object>> moroccanCities = new ArrayList<>();
        
        // Moroccan cities with IATA codes
        Map<String, String[]> cities = new HashMap<>();
        cities.put("CMN", new String[]{"Casablanca", "Mohamed V International Airport"});
        cities.put("RAK", new String[]{"Marrakech", "Marrakech Menara Airport"});
        cities.put("RBA", new String[]{"Rabat", "Rabat-Salé Airport"});
        cities.put("FEZ", new String[]{"Fes", "Fès-Saïss Airport"});
        cities.put("TNG", new String[]{"Tangier", "Tangier Ibn Battouta Airport"});
        cities.put("AGA", new String[]{"Agadir", "Agadir Al Massira Airport"});
        cities.put("OUD", new String[]{"Ouarzazate", "Ouarzazate Airport"});
        cities.put("ESU", new String[]{"Essaouira", "Essaouira-Mogador Airport"});
        
        for (Map.Entry<String, String[]> entry : cities.entrySet()) {
            String iataCode = entry.getKey();
            String cityName = entry.getValue()[0];
            String airportName = entry.getValue()[1];
            
            // Match if keyword matches IATA code or city name
            if (iataCode.toLowerCase().contains(lowerKeyword) || 
                cityName.toLowerCase().contains(lowerKeyword) ||
                airportName.toLowerCase().contains(lowerKeyword)) {
                
                Map<String, Object> city = new HashMap<>();
                city.put("id", "MOR_" + iataCode);
                city.put("name", cityName);
                city.put("iataCode", iataCode);
                city.put("country", "Morocco");
                moroccanCities.add(city);
                
                log.debug("  ✓ Fallback match: {} ({}) - Morocco", cityName, iataCode);
            }
        }
        
        return moroccanCities;
    }

    /**
     * Search flights using Amadeus Flight Offers API
     */
    public List<FlightDTO> searchFlights(String origin, String destination, String departureDate) {
        try {
            String accessToken = authService.getAccessToken();
            log.info("✓ Got valid access token, searching Amadeus API");
            log.info("  Route: {} → {} on {}", origin, destination, departureDate);
            
            String url = String.format("%s/shopping/flight-offers?originLocationCode=%s&destinationLocationCode=%s&departureDate=%s&adults=1&max=10",
                    AMADEUS_API_URL, origin, destination, departureDate);

            HttpHeaders headers = createAuthHeaders(accessToken);
            HttpEntity<String> entity = new HttpEntity<>(headers);

            String response = restTemplate.exchange(url, org.springframework.http.HttpMethod.GET, entity, String.class).getBody();
            if (response == null || response.isEmpty()) {
                log.error("✗ Amadeus API returned empty response for flights");
                return new ArrayList<>();
            }
            return parseFlightOffers(response, destination);

        } catch (Exception e) {
            log.error("✗ Error searching flights from Amadeus: {}", e.getMessage());
            return new ArrayList<>();
        }
    }
    /**
     * Search hotels using Amadeus TWO-STEP flow:
     * 1. Get hotel IDs by city
     * 2. Get hotel offers using those IDs + dates
     */
    public List<HotelDTO> searchHotels(String cityCode, String checkIn, String checkOut) {
        try {
            String accessToken = authService.getAccessToken();
            log.info("✓ Starting Amadeus hotel search for {} ({} to {})", cityCode, checkIn, checkOut);
            
            // STEP 1: Get hotel IDs by city
            List<String> hotelIds = getHotelIdsByCity(accessToken, cityCode);
            if (hotelIds.isEmpty()) {
                log.warn("No hotels found for city code: {}", cityCode);
                return new ArrayList<>();
            }
            log.info("Found {} hotels in {}", hotelIds.size(), cityCode);
            
            // STEP 2: Get hotel offers using those IDs
            List<HotelDTO> hotels = getHotelOffers(accessToken, hotelIds, checkIn, checkOut);
            log.info("Retrieved {} hotel offers", hotels.size());
            return hotels;

        } catch (Exception e) {
            log.error("✗ Error searching hotels from Amadeus: {}", e.getMessage());
            log.debug("Full error:", e);
            return new ArrayList<>();
        }
    }

    /**
     * STEP 1: Get hotel IDs for a given city
     * Calls: GET /v1/reference-data/locations/hotels/by-city
     */
    private List<String> getHotelIdsByCity(String accessToken, String cityCode) throws Exception {
        String url = String.format(
            "https://test.api.amadeus.com/v1/reference-data/locations/hotels/by-city?cityCode=%s&max=5",
            cityCode);
        log.info("  [Step 1] Fetching hotel IDs from: {}", url);

        HttpHeaders headers = createAuthHeaders(accessToken);
        HttpEntity<String> entity = new HttpEntity<>(headers);

        String response = restTemplate.exchange(url, org.springframework.http.HttpMethod.GET, entity, String.class).getBody();
        
        List<String> hotelIds = new ArrayList<>();
        if (response != null && !response.isEmpty()) {
            JsonNode jsonNode = objectMapper.readTree(response);
            JsonNode data = jsonNode.get("data");
            
            if (data != null && data.isArray()) {
                for (JsonNode hotel : data) {
                    if (hotel.has("hotelId")) {
                        hotelIds.add(hotel.get("hotelId").asText());
                    }
                }
            }
        }
        
        log.info("  [Step 1] Extracted {} hotel IDs: {}", hotelIds.size(), hotelIds);
        return hotelIds;
    }

    /**
     * STEP 2: Get hotel offers for given IDs and dates
     * Calls: GET /v3/shopping/hotel-offers
     */
    private List<HotelDTO> getHotelOffers(String accessToken, List<String> hotelIds, String checkIn, String checkOut) throws Exception {
        // Build comma-separated hotel IDs string
        String hotelIdString = String.join(",", hotelIds);
        
        String url = String.format(
            "https://test.api.amadeus.com/v3/shopping/hotel-offers?hotelIds=%s&checkInDate=%s&checkOutDate=%s&adults=1&max=10",
            hotelIdString, checkIn, checkOut);
        log.info("  [Step 2] Fetching offers from: {}", url);

        HttpHeaders headers = createAuthHeaders(accessToken);
        HttpEntity<String> entity = new HttpEntity<>(headers);

        String response = restTemplate.exchange(url, org.springframework.http.HttpMethod.GET, entity, String.class).getBody();
        
        List<HotelDTO> hotels = new ArrayList<>();
        if (response != null && !response.isEmpty()) {
            JsonNode jsonNode = objectMapper.readTree(response);
            JsonNode data = jsonNode.get("data");
            
            if (data != null && data.isArray()) {
                long hotelId = 1;
                for (JsonNode offer : data) {
                    try {
                        String hotelName = offer.has("hotel") && offer.get("hotel").has("name") ? 
                            offer.get("hotel").get("name").asText() : "Hotel " + hotelId;
                        
                        String hotelCode = offer.has("hotel") && offer.get("hotel").has("hotelId") ?
                            offer.get("hotel").get("hotelId").asText() : "";
                        
                        // Get price from the first offer
                        BigDecimal price = BigDecimal.ZERO;
                        if (offer.has("offers") && offer.get("offers").size() > 0) {
                            JsonNode firstOffer = offer.get("offers").get(0);
                            if (firstOffer.has("price") && firstOffer.get("price").has("total")) {
                                price = new BigDecimal(firstOffer.get("price").get("total").asText());
                            }
                        }
                        
                        // Get address
                        String address = "City Center";
                        if (offer.has("hotel") && offer.get("hotel").has("address")) {
                            JsonNode addr = offer.get("hotel").get("address");
                            if (addr.has("lines") && addr.get("lines").size() > 0) {
                                address = addr.get("lines").get(0).asText();
                            }
                        }
                        
                        // Get rating
                        int rating = 4;
                        if (offer.has("hotel") && offer.get("hotel").has("rating")) {
                            rating = offer.get("hotel").get("rating").asInt();
                        }
                        
                        HotelDTO hotel = new HotelDTO(
                            hotelId++,
                            hotelName,
                            price,
                            Math.max(1, 30 - (int)(Math.random() * 20)), // Available rooms
                            1L,
                            address,
                            rating,
                            "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
                            "Comfortable accommodations with quality service and convenient amenities"
                        );
                        hotels.add(hotel);
                    } catch (Exception e) {
                        log.warn("Error parsing hotel offer: {}", e.getMessage());
                    }
                }
            }
        }
        
        log.info("  [Step 2] Parsed {} hotel offers", hotels.size());
        return hotels;
    }

    /**
     * Parse flight offers response from Amadeus
     */
    private List<FlightDTO> parseFlightOffers(String response, String destinationCode) throws Exception {
        List<FlightDTO> flights = new ArrayList<>();
        JsonNode jsonNode = objectMapper.readTree(response);
        JsonNode data = jsonNode.get("data");

        if (data != null && data.isArray()) {
            long flightId = 1;
            for (JsonNode offer : data) {
                try {
                    JsonNode itineraries = offer.get("itineraries");
                    if (itineraries != null && itineraries.size() > 0) {
                        JsonNode firstSegment = itineraries.get(0).get("segments").get(0);
                        
                        LocalDateTime departure = LocalDateTime.parse(
                            firstSegment.get("departure").get("at").asText(),
                            DateTimeFormatter.ISO_DATE_TIME);
                        LocalDateTime arrival = LocalDateTime.parse(
                            itineraries.get(itineraries.size() - 1)
                                .get("segments")
                                .get(itineraries.get(itineraries.size() - 1).get("segments").size() - 1)
                                .get("arrival").get("at").asText(),
                            DateTimeFormatter.ISO_DATE_TIME);

                        BigDecimal price = new BigDecimal(offer.get("price").get("grandTotal").asText());
                        String airline = firstSegment.get("operating").has("carrierCode") ? 
                            firstSegment.get("operating").get("carrierCode").asText() : 
                            firstSegment.get("carrierCode").asText();

                        FlightDTO flight = new FlightDTO(
                            flightId++,
                            departure,
                            arrival,
                            price,
                            100 + (int)(Math.random() * 50), // Mock available seats
                            1L, // destination ID
                            airline,
                            firstSegment.get("number").asText(),
                            "https://images.unsplash.com/photo-1542296332-2e4473faf563?w=800"
                        );
                        flights.add(flight);
                    }
                } catch (Exception e) {
                    log.warn("Error parsing flight offer", e);
                }
            }
        }

        log.info("Parsed {} flight offers", flights.size());
        return flights;
    }

    /**
     * Parse hotel reference data response from Amadeus
     * Handles the response from /v1/reference-data/locations/hotels/by-city endpoint
     */
    private List<HotelDTO> parseHotelOffers(String response, String cityCode) throws Exception {
        List<HotelDTO> hotels = new ArrayList<>();
        JsonNode jsonNode = objectMapper.readTree(response);
        JsonNode data = jsonNode.get("data");

        if (data != null && data.isArray()) {
            long hotelId = 1;
            for (JsonNode hotelNode : data) {
                try {
                    // Extract hotel information from reference data format
                    String hotelCode = hotelNode.has("hotelCode") ? hotelNode.get("hotelCode").asText() : "HOTEL-" + hotelId;
                    String name = hotelNode.has("name") ? hotelNode.get("name").asText() : "Hotel " + hotelId;
                    
                    // Get address info
                    String address = "City Center, " + getCityName(cityCode);
                    if (hotelNode.has("address")) {
                        JsonNode addr = hotelNode.get("address");
                        if (addr.has("lines") && addr.get("lines").size() > 0) {
                            address = addr.get("lines").get(0).asText();
                        }
                    }
                    
                    // Generate realistic pricing based on hotel star rating
                    int rating = hotelNode.has("rating") ? hotelNode.get("rating").asInt() : (3 + (int)(hotelId % 3));
                    BigDecimal price = new BigDecimal(80 + (rating * 30)); // $80-$170 per night
                    
                    HotelDTO hotel = new HotelDTO(
                        hotelId++,
                        name,
                        price,
                        20 + (int)(Math.random() * 80), // Available rooms
                        1L, // destination ID
                        address,
                        rating,
                        "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
                        "Premium hotel with world-class amenities, exceptional service, and comfortable accommodations"
                    );
                    hotels.add(hotel);
                } catch (Exception e) {
                    log.warn("Error parsing hotel data: {}", e.getMessage());
                }
            }
        }

        log.info("Parsed {} hotels for city code {}", hotels.size(), cityCode);
        return hotels;
    }

    /**
     * Convert city code to city name for display purposes
     */
    private String getCityName(String code) {
        return switch(code.toUpperCase()) {
            case "PAR" -> "Paris";
            case "LON" -> "London";
            case "NYC" -> "New York";
            case "TYO" -> "Tokyo";
            case "DXB" -> "Dubai";
            case "BCN" -> "Barcelona";
            case "ROM" -> "Rome";
            case "BKK" -> "Bangkok";
            case "SYD" -> "Sydney";
            case "CDG" -> "Paris";
            case "LHR" -> "London";
            default -> code;
        };
    }

    /**
     * Create HTTP headers with Authorization token
     */
    private HttpHeaders createAuthHeaders(String accessToken) {
        HttpHeaders headers = new HttpHeaders();
        if (accessToken == null || accessToken.isEmpty()) {
            log.error("ERROR: Access token is null or empty!");
        } else {
            log.debug("Creating auth header with token length: {}", accessToken.length());
            headers.set("Authorization", "Bearer " + accessToken);
        }
        headers.setContentType(MediaType.APPLICATION_JSON);
        return headers;
    }
}
