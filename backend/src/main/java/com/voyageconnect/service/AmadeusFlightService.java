package com.voyageconnect.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.voyageconnect.dto.FlightDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@Slf4j
public class AmadeusFlightService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${amadeus.api.key:test_key}")
    private String apiKey;

    @Value("${amadeus.api.secret:test_secret}")
    private String apiSecret;

    private static final String AMADEUS_BASE_URL = "https://api.amadeus.com/v2";
    private String accessToken = null;
    private long tokenExpiry = 0;

    public AmadeusFlightService(RestTemplate restTemplate, ObjectMapper objectMapper) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
    }

    public List<FlightDTO> searchFlights(String origin, String destination, String departureDate) {
        try {
            // For demo: generate mock flights based on search parameters
            return generateMockFlights(origin, destination, departureDate);
        } catch (Exception e) {
            log.error("Error searching flights from Amadeus", e);
            return new ArrayList<>();
        }
    }

    private List<FlightDTO> generateMockFlights(String origin, String destination, String departureDate) {
        List<FlightDTO> flights = new ArrayList<>();
        Random random = new Random();
        
        String[] airlines = {
            "Delta Airlines", "United Airlines", "American Airlines", "Emirates",
            "Lufthansa", "Air France", "British Airways", "Qatar Airways"
        };
        
        String[] imageUrls = {
            "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800",
            "https://images.unsplash.com/photo-1474302770737-173ee21bab63?w=800",
            "https://images.unsplash.com/photo-1583500557349-fb5238f8d946?w=800",
            "https://images.unsplash.com/photo-1542296332-2e4473faf563?w=800",
            "https://images.unsplash.com/photo-1520483601560-4b62a51f2e80?w=800"
        };

        // Generate 5-8 flights per search
        int numFlights = 5 + random.nextInt(4);
        DateTimeFormatter formatter = DateTimeFormatter.ISO_DATE_TIME;
        
        for (int i = 0; i < numFlights; i++) {
            LocalDateTime departure = LocalDateTime.parse(departureDate + "T" + String.format("%02d", 6 + i) + ":00:00");
            int duration = 2 + random.nextInt(10); // 2-12 hours
            LocalDateTime arrival = departure.plusHours(duration);
            
            BigDecimal price = BigDecimal.valueOf(100 + random.nextInt(900));
            int seats = 50 + random.nextInt(150);
            
            FlightDTO flight = new FlightDTO(
                (long) i,
                departure,
                arrival,
                price,
                seats,
                1L, // destination ID
                airlines[random.nextInt(airlines.length)],
                "AA" + String.format("%04d", i + 1000),
                imageUrls[random.nextInt(imageUrls.length)]
            );
            flights.add(flight);
        }
        
        return flights;
    }

    private String getAccessToken() throws Exception {
        if (accessToken != null && System.currentTimeMillis() < tokenExpiry) {
            return accessToken;
        }

        String tokenUrl = AMADEUS_BASE_URL + "/security/oauth2/token";
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        
        String body = "grant_type=client_credentials&client_id=" + apiKey + "&client_secret=" + apiSecret;
        HttpEntity<String> entity = new HttpEntity<>(body, headers);
        
        try {
            ResponseEntity<String> response = restTemplate.postForEntity(tokenUrl, entity, String.class);
            JsonNode node = objectMapper.readTree(response.getBody());
            accessToken = node.get("access_token").asText();
            long expiresIn = node.get("expires_in").asLong();
            tokenExpiry = System.currentTimeMillis() + (expiresIn * 1000) - 10000; // Refresh 10s before expiry
            return accessToken;
        } catch (Exception e) {
            log.warn("Failed to get Amadeus token, using demo mode", e);
            return "demo_token";
        }
    }
}
