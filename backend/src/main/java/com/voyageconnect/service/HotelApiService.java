package com.voyageconnect.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.voyageconnect.dto.HotelDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

/**
 * Service for integrating with Booking.com API via RapidAPI
 * Provides hotel search functionality by city, dates, and other parameters
 */
@Service
@Slf4j
public class HotelApiService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    
    @Value("${rapidapi.booking.key}")
    private String rapidApiKey;
    
    @Value("${rapidapi.booking.host}")
    private String rapidApiHost;
    
    @Value("${rapidapi.booking.base-url}")
    private String baseUrl;

    public HotelApiService(RestTemplate restTemplate, ObjectMapper objectMapper) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
    }

    /**
     * Search hotels by city code and dates
     * 
     * @param cityCode City IATA code (e.g., "PAR" for Paris)
     * @param checkIn Check-in date
     * @param checkOut Check-out date
     * @return List of hotels with pricing and availability
     */
    public List<HotelDTO> getHotelsByCity(String cityCode, LocalDate checkIn, LocalDate checkOut) {
        try {
            // Step 1: Convert IATA code to city name
            String cityName = mapCityCodeToName(cityCode);
            log.info("✓ Converted city code: {} to city name: {}", cityCode, cityName);
            
            // Step 2: Get Booking.com city_id
            String bookingCityId = getBookingCityId(cityName);
            if (bookingCityId == null || bookingCityId.isEmpty()) {
                log.error("✗ Could not find Booking.com city_id for: {}", cityName);
                return new ArrayList<>();
            }
            
            // Step 3: Search hotels using city_id
            log.info("✓ Starting hotel search for city_id: {} with dates: {} to {}", 
                bookingCityId, checkIn, checkOut);
            
            List<HotelDTO> hotels = searchHotels(bookingCityId, checkIn, checkOut);
            log.info("✓ Successfully retrieved {} hotels from Booking.com for {}", 
                hotels.size(), cityName);
            
            return hotels;
            
        } catch (Exception e) {
            log.error("✗ Error getting hotels by city: {}", e.getMessage());
            return new ArrayList<>();
        }
    }

    /**
     * Get Booking.com city_id from city name
     * Calls Booking.com /v1/static/cities endpoint
     */
    private String getBookingCityId(String cityName) {
        try {
            String url = String.format("%s/v1/static/cities?name=%s", baseUrl, cityName);
            
            log.info("✓ Fetching Booking city_id from: {}", url);
            log.info("✓ Using RapidAPI key: {}...", rapidApiKey.substring(0, 10));
            
            HttpHeaders headers = createRapidApiHeaders();
            HttpEntity<String> entity = new HttpEntity<>(headers);
            
            ResponseEntity<String> response = restTemplate.exchange(
                url, HttpMethod.GET, entity, String.class);
            
            String responseBody = response.getBody();
            log.info("✓ Cities API HTTP status: {}", response.getStatusCode());
            log.debug("Cities API response: {}", responseBody);
            
            if (responseBody != null && !responseBody.isEmpty()) {
                try {
                    JsonNode root = objectMapper.readTree(responseBody);
                    if (root.isArray() && root.size() > 0) {
                        JsonNode firstCity = root.get(0);
                        if (firstCity.has("city_id")) {
                            String cityId = firstCity.get("city_id").asText();
                            log.info("✓ Found Booking city_id: {} for city: {}", cityId, cityName);
                            return cityId;
                        }
                    }
                } catch (Exception parseErr) {
                    log.warn("Could not parse JSON response: {}", parseErr.getMessage());
                    // Try manual parsing as fallback
                    if (responseBody.contains("\"city_id\"")) {
                        int startIndex = responseBody.indexOf("\"city_id\":") + 10;
                        int endIndex = responseBody.indexOf(",", startIndex);
                        if (endIndex == -1) endIndex = responseBody.indexOf("}", startIndex);
                        if (startIndex > 9 && endIndex > startIndex) {
                            String cityId = responseBody.substring(startIndex, endIndex).trim().replace("\"", "");
                            log.info("✓ Found Booking city_id (manual parse): {} for city: {}", cityId, cityName);
                            return cityId;
                        }
                    }
                }
            }
            
            log.warn("✗ No city_id found for: {}. Response was empty or invalid.", cityName);
            return null;
        } catch (Exception e) {
            log.error("✗ Error getting Booking city_id for {}: {} - {}", cityName, e.getClass().getSimpleName(), e.getMessage());
            if (e.getMessage() != null && e.getMessage().contains("401")) {
                log.error("✗ Authentication failed. Check your RapidAPI key.");
            } else if (e.getMessage() != null && e.getMessage().contains("403")) {
                log.error("✗ Access forbidden. Your RapidAPI subscription may not include this endpoint.");
            } else if (e.getMessage() != null && e.getMessage().contains("429")) {
                log.error("✗ Rate limit exceeded. Wait before making more requests.");
            }
            return null;
        }
    }

    /**
     * Search hotels for a specific Booking city_id and dates
     */
    private List<HotelDTO> searchHotels(String cityId, LocalDate checkIn, LocalDate checkOut) {
        try {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
            String checkInStr = checkIn.format(formatter);
            String checkOutStr = checkOut.format(formatter);
            
            String url = String.format(
                "%s/v2/hotels/search?checkin_date=%s&checkout_date=%s&adults_number=1&room_number=1&order_by=popularity&filter_by_currency=USD&locale=en-gb&city_id=%s",
                baseUrl, checkInStr, checkOutStr, cityId);
            
            log.info("✓ Searching hotels with Booking city_id: {}", cityId);
            log.info("✓ Booking API URL: {}", url);
            
            HttpHeaders headers = createRapidApiHeaders();
            HttpEntity<String> entity = new HttpEntity<>(headers);
            
            ResponseEntity<String> response = restTemplate.exchange(
                url, HttpMethod.GET, entity, String.class);
            
            String responseBody = response.getBody();
            if (responseBody == null || responseBody.isEmpty()) {
                log.warn("✗ Empty response from Booking.com API");
                return new ArrayList<>();
            }
            
            log.info("✓ Hotels API response received, length: {} chars", responseBody.length());
            
            // Parse the response and convert to HotelDTO list
            List<HotelDTO> hotels = parseHotelsResponse(responseBody);
            log.info("✓ Successfully fetched {} hotels from Booking.com", hotels.size());
            return hotels;
            
        } catch (Exception e) {
            log.error("✗ Error searching hotels: {}", e.getMessage());
            return new ArrayList<>();
        }
    }

    /**
     * Parse Booking.com API v2 response to HotelDTO list
     */
    private List<HotelDTO> parseHotelsResponse(String jsonResponse) {
        List<HotelDTO> hotels = new ArrayList<>();
        
        try {
            JsonNode root = objectMapper.readTree(jsonResponse);
            
            // Response structure: { "result": [ { "hotel_id", "hotel_name", "price_breakdown": { "gross_price": X }, "review_score": X, ... } ] }
            JsonNode result = root.get("result");
            if (result != null && result.isArray()) {
                int count = 0;
                for (JsonNode hotelNode : result) {
                    if (count >= 6) break; // Limit to 6 hotels
                    
                    try {
                        long hotelId = hotelNode.has("hotel_id") ? hotelNode.get("hotel_id").asLong() : count + 1;
                        String hotelName = hotelNode.has("hotel_name") ? hotelNode.get("hotel_name").asText() : "Unknown Hotel";
                        
                        // Extract price
                        BigDecimal price = BigDecimal.valueOf(200.0);
                        if (hotelNode.has("price_breakdown") && hotelNode.get("price_breakdown").has("gross_price")) {
                            double priceVal = hotelNode.get("price_breakdown").get("gross_price").asDouble();
                            price = new BigDecimal(priceVal);
                        }
                        
                        // Extract address
                        String address = "City Center";
                        if (hotelNode.has("address")) {
                            address = hotelNode.get("address").asText();
                        }
                        
                        // Extract rating
                        double rating = 4.0;
                        if (hotelNode.has("review_score")) {
                            rating = hotelNode.get("review_score").asDouble();
                            if (rating > 10) rating = rating / 2; // Some APIs return 0-10, we need 0-5
                        }
                        
                        // Extract image URL
                        String imageUrl = "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=300&fit=crop";
                        if (hotelNode.has("max_photo_url")) {
                            imageUrl = hotelNode.get("max_photo_url").asText();
                        } else if (hotelNode.has("photo")) {
                            imageUrl = hotelNode.get("photo").asText();
                        }
                        
                        String description = hotelNode.has("hotel_type_name") ? 
                            hotelNode.get("hotel_type_name").asText() : "Quality hotel with comfortable accommodations";
                        
                        HotelDTO hotel = new HotelDTO(
                            hotelId,
                            hotelName,
                            price,
                            25, // Available rooms
                            1L, // Destination ID
                            address,
                            (int) Math.min(rating, 5),
                            imageUrl,
                            description
                        );
                        
                        hotels.add(hotel);
                        log.info("✓ Parsed hotel: {} - {}", hotelName, price);
                        count++;
                        
                    } catch (Exception e) {
                        log.warn("✗ Error parsing individual hotel: {}", e.getMessage());
                    }
                }
            }
            
            log.info("✓ Successfully parsed {} hotels from Booking.com", hotels.size());
            
        } catch (Exception e) {
            log.error("✗ Error parsing Booking.com response: {}", e.getMessage());
        }
        
        return hotels;
    }

    /**
     * Create HTTP headers for RapidAPI authentication
     */
    private HttpHeaders createRapidApiHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.set("x-rapidapi-key", rapidApiKey);
        headers.set("x-rapidapi-host", rapidApiHost);
        headers.set("Accept", "application/json");
        return headers;
    }

    /**
     * Map IATA city codes to city names for Booking.com API
     */
    private String mapCityCodeToName(String cityCode) {
        return switch (cityCode.toUpperCase()) {
            case "PAR", "CDG" -> "Paris";
            case "LON", "LHR" -> "London";
            case "NYC", "JFK" -> "New York";
            case "TYO", "NRT" -> "Tokyo";
            case "DXB" -> "Dubai";
            case "BCN" -> "Barcelona";
            case "ROM", "FCO" -> "Rome";
            case "BKK" -> "Bangkok";
            case "SYD" -> "Sydney";
            case "AMS" -> "Amsterdam";
            case "BER" -> "Berlin";
            case "MAD" -> "Madrid";
            default -> cityCode;
        };
    }
}
