package com.voyageconnect.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.HashMap;
import java.util.Map;

/**
 * Service for Booking.com API integration via RapidAPI (apidojo-booking-v1)
 * Strategy:
 * - Moroccan cities: Use map-based search with bounding boxes (properties/list-by-map)
 * - Other cities: Use destination-ID search (properties/list)
 * Returns REAL Booking.com data ONLY - NO mock/fallback data
 */
@Service
@Slf4j
public class BookingApiService {

    private final RestTemplate restTemplate;
    
    @Value("${rapidapi.booking.key}")
    private String rapidApiKey;
    
    @Value("${rapidapi.booking.host}")
    private String rapidApiHost;
    
    @Value("${rapidapi.booking.base-url}")
    private String baseUrl;

    // IATA code to city name mapping
    private static final Map<String, String> IATA_TO_CITY = new HashMap<>();
    
    // Booking.com destination IDs for major cities
    private static final Map<String, String> CITY_DEST_ID_MAP = new HashMap<>();
    
    // Bounding boxes for Moroccan cities (map-based search)
    // RapidAPI free tier: dest_id search unreliable for Morocco
    // Official Booking.com strategy: bbox coordinates
    // Format: {ne_lat, ne_lon, sw_lat, sw_lon}
    private static final Map<String, double[]> MOROCCAN_BOUNDING_BOXES = new HashMap<>();
    
    static {
        // IATA code mappings
        IATA_TO_CITY.put("PAR", "PARIS");
        IATA_TO_CITY.put("CDG", "PARIS");
        IATA_TO_CITY.put("ORY", "PARIS");
        IATA_TO_CITY.put("LON", "LONDON");
        IATA_TO_CITY.put("LHR", "LONDON");
        IATA_TO_CITY.put("LGW", "LONDON");
        IATA_TO_CITY.put("BCN", "BARCELONA");
        IATA_TO_CITY.put("DXB", "DUBAI");
        IATA_TO_CITY.put("NYC", "NEW YORK");
        IATA_TO_CITY.put("JFK", "NEW YORK");
        IATA_TO_CITY.put("EWR", "NEW YORK");
        IATA_TO_CITY.put("LGA", "NEW YORK");
        IATA_TO_CITY.put("TYO", "TOKYO");
        IATA_TO_CITY.put("NRT", "TOKYO");
        IATA_TO_CITY.put("HND", "TOKYO");
        IATA_TO_CITY.put("ROM", "ROME");
        IATA_TO_CITY.put("FCO", "ROME");
        IATA_TO_CITY.put("MAD", "MADRID");
        IATA_TO_CITY.put("AMS", "AMSTERDAM");
        IATA_TO_CITY.put("BER", "BERLIN");
        
        // Moroccan cities - IATA codes
        IATA_TO_CITY.put("CMN", "CASABLANCA");  // Casablanca Mohamed V
        IATA_TO_CITY.put("RAK", "MARRAKECH");   // Marrakech Menara
        IATA_TO_CITY.put("RBA", "RABAT");       // Rabat-Salé
        IATA_TO_CITY.put("FEZ", "FES");         // Fes-Saïss
        IATA_TO_CITY.put("TNG", "TANGIER");     // Tangier Ibn Battouta
        IATA_TO_CITY.put("AGA", "AGADIR");      // Agadir Al Massira
        IATA_TO_CITY.put("OUD", "OUARZAZATE"); // Ouarzazate
        IATA_TO_CITY.put("ESU", "ESSAOUIRA");  // Essaouira
        
        // Booking.com destination IDs
        CITY_DEST_ID_MAP.put("PARIS", "-1456928");
        CITY_DEST_ID_MAP.put("LONDON", "-2601889");
        CITY_DEST_ID_MAP.put("BARCELONA", "-372490");
        CITY_DEST_ID_MAP.put("DUBAI", "-782831");
        CITY_DEST_ID_MAP.put("NEW YORK", "20088325");
        CITY_DEST_ID_MAP.put("TOKYO", "-246227");
        CITY_DEST_ID_MAP.put("ROME", "-126693");
        CITY_DEST_ID_MAP.put("MADRID", "-390625");
        CITY_DEST_ID_MAP.put("AMSTERDAM", "-2140479");
        CITY_DEST_ID_MAP.put("BERLIN", "-1746443");
        
        // Moroccan cities: Use map-based search with bounding boxes
        MOROCCAN_BOUNDING_BOXES.put("CASABLANCA", new double[]{33.65, -7.45, 33.50, -7.80});
        MOROCCAN_BOUNDING_BOXES.put("MARRAKECH", new double[]{31.75, -7.90, 31.55, -8.05});
        MOROCCAN_BOUNDING_BOXES.put("MARRAKESH", new double[]{31.75, -7.90, 31.55, -8.05});
        MOROCCAN_BOUNDING_BOXES.put("RABAT", new double[]{34.10, -6.75, 34.00, -6.90});
        MOROCCAN_BOUNDING_BOXES.put("FES", new double[]{34.10, -4.95, 33.95, -5.10});
        MOROCCAN_BOUNDING_BOXES.put("FEZ", new double[]{34.10, -4.95, 33.95, -5.10});
        MOROCCAN_BOUNDING_BOXES.put("TANGIER", new double[]{35.85, -5.70, 35.70, -5.95});
        MOROCCAN_BOUNDING_BOXES.put("AGADIR", new double[]{30.50, -9.45, 30.35, -9.65});
        MOROCCAN_BOUNDING_BOXES.put("OUARZAZATE", new double[]{31.00, -6.85, 30.85, -7.00});
        MOROCCAN_BOUNDING_BOXES.put("ESSAOUIRA", new double[]{31.55, -9.70, 31.45, -9.85});
        MOROCCAN_BOUNDING_BOXES.put("CHEFCHAOUEN", new double[]{35.25, -5.20, 35.15, -5.35});
        MOROCCAN_BOUNDING_BOXES.put("MEKNES", new double[]{33.95, -5.50, 33.85, -5.65});
    }

    public BookingApiService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    /**
     * Get hotels by city using Booking.com API
     * Strategy:
     * - Moroccan cities: Use map-based search (properties/list-by-map)
     * - Other cities: Use destination-ID search (properties/list)
     * Returns REAL Booking.com data only - NO mock/fallback data
     */
    public String getHotelsByCity(String cityInput) {
        try {
            // Convert IATA code to city name if needed
            String cityName = cityInput.toUpperCase().trim();
            if (IATA_TO_CITY.containsKey(cityName)) {
                cityName = IATA_TO_CITY.get(cityName);
                log.info("✓ Converted IATA code '{}' to city '{}'", cityInput, cityName);
            } else {
                log.info("✓ Searching hotels for: '{}'", cityInput);
            }
            
            // Moroccan cities: Use map-based search
            if (MOROCCAN_BOUNDING_BOXES.containsKey(cityName)) {
                log.info("✓ Using map-based search for Moroccan city: {}", cityName);
                return getHotelsByMapSearch(cityName);
            }
            
            // Other cities: Use standard destination-ID search
            String destId = getDestinationId(cityName);
            if (destId == null) {
                log.warn("✗ No destination ID found for city: {}", cityInput);
                return "{\"result\":[],\"count\":0,\"total_count_with_filters\":0}";
            }

            String url = buildUrlWithDestId(destId);
            log.info("✓ Calling Booking API with dest_id: {}", destId);
            
            HttpHeaders headers = createHeaders();
            HttpEntity<String> entity = new HttpEntity<>(headers);
            
            ResponseEntity<String> response = restTemplate.exchange(
                url, HttpMethod.GET, entity, String.class);
            
            log.info("✓ Booking API responded: {}", response.getStatusCode());
            
            return response.getBody() != null ? response.getBody() : "{\"result\":[],\"count\":0}";
            
        } catch (Exception e) {
            log.error("✗ Error fetching hotels: {} - {}", e.getClass().getSimpleName(), e.getMessage());
            return "{\"result\":[],\"count\":0,\"total_count_with_filters\":0}";
        }
    }
    
    /**
     * Get hotels for Moroccan cities using map-based search
     * Uses properties/list-by-map endpoint with real bounding box coordinates
     * Returns REAL Booking.com data - production-safe, free-tier compatible
     */
    private String getHotelsByMapSearch(String cityName) {
        try {
            double[] bbox = MOROCCAN_BOUNDING_BOXES.get(cityName);
            if (bbox == null) {
                log.error("✗ No bounding box for: {}", cityName);
                return "{\"result\":[],\"count\":0}";
            }
            
            String url = buildUrlWithBbox(bbox);
            log.info("✓ Map search bbox=[{},{},{},{}]", bbox[0], bbox[1], bbox[2], bbox[3]);
            
            HttpHeaders headers = createHeaders();
            HttpEntity<String> entity = new HttpEntity<>(headers);
            
            ResponseEntity<String> response = restTemplate.exchange(
                url, HttpMethod.GET, entity, String.class);
            
            log.info("✓ Map search responded: {}", response.getStatusCode());
            
            return response.getBody() != null ? response.getBody() : "{\"result\":[],\"count\":0}";
            
        } catch (Exception e) {
            log.error("✗ Map search failed for {}: {}", cityName, e.getMessage());
            return "{\"result\":[],\"count\":0}";
        }
    }

    private String getDestinationId(String cityName) {
        String normalized = cityName.toUpperCase().trim();
        if (CITY_DEST_ID_MAP.containsKey(normalized)) {
            return CITY_DEST_ID_MAP.get(normalized);
        }
        // Try partial match
        for (Map.Entry<String, String> entry : CITY_DEST_ID_MAP.entrySet()) {
            if (entry.getKey().contains(normalized) || normalized.contains(entry.getKey())) {
                log.info("✓ Matched '{}' to '{}'", cityName, entry.getKey());
                return entry.getValue();
            }
        }
        return null;
    }

    private String buildUrlWithDestId(String destId) {
        java.time.LocalDate today = java.time.LocalDate.now();
        String arrivalDate = today.plusDays(1).toString();
        String departureDate = today.plusDays(4).toString();
        
        return UriComponentsBuilder.fromHttpUrl(baseUrl + "/properties/list")
            .queryParam("offset", "0")
            .queryParam("arrival_date", arrivalDate)
            .queryParam("departure_date", departureDate)
            .queryParam("guest_qty", "1")
            .queryParam("room_qty", "1")
            .queryParam("dest_ids", destId)
            .queryParam("order_by", "popularity")
            .queryParam("languagecode", "en-us")
            .queryParam("currency_code", "EUR")
            .build()
            .toUriString();
    }

    private String buildUrlWithBbox(double[] bbox) {
        java.time.LocalDate today = java.time.LocalDate.now();
        String arrivalDate = today.plusDays(1).toString();
        String departureDate = today.plusDays(4).toString();
        
        // bbox format for Booking.com: "lon_west,lat_north,lon_east,lat_south"
        String bboxParam = String.format("%.6f,%.6f,%.6f,%.6f", bbox[3], bbox[0], bbox[1], bbox[2]);
        
        return UriComponentsBuilder.fromHttpUrl(baseUrl + "/properties/list-by-map")
            .queryParam("bbox", bboxParam)
            .queryParam("arrival_date", arrivalDate)
            .queryParam("departure_date", departureDate)
            .queryParam("room_qty", "1")
            .queryParam("guest_qty", "1")
            .queryParam("order_by", "popularity")
            .queryParam("languagecode", "en-us")
            .queryParam("travel_purpose", "leisure")
            .queryParam("currency_code", "EUR")
            .build()
            .toUriString();
    }

    private HttpHeaders createHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.set("x-rapidapi-key", rapidApiKey);
        headers.set("x-rapidapi-host", rapidApiHost);
        return headers;
    }
}
