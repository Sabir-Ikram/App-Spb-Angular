package com.voyageconnect.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/health")
@CrossOrigin(origins = "*")
@Slf4j
public class ApiHealthController {

    private final RestTemplate restTemplate;
    
    @Value("${rapidapi.booking.key}")
    private String rapidApiKey;
    
    @Value("${rapidapi.booking.host}")
    private String rapidApiHost;
    
    @Value("${rapidapi.booking.base-url}")
    private String baseUrl;

    public ApiHealthController(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @GetMapping("/booking")
    public ResponseEntity<Map<String, Object>> checkBookingApi() {
        Map<String, Object> result = new HashMap<>();
        
        try {
            String bbox = "48.815573,2.224199,48.902145,2.469921"; // Paris
            String url = baseUrl + "/properties/list-by-map" +
                "?room_qty=1" +
                "&guest_qty=1" +
                "&bbox=" + bbox +
                "&price_filter_currencycode=EUR" +
                "&languagecode=en-us" +
                "&travel_purpose=leisure" +
                "&order_by=popularity" +
                "&offset=0";
            
            HttpHeaders headers = new HttpHeaders();
            headers.set("x-rapidapi-key", rapidApiKey);
            headers.set("x-rapidapi-host", rapidApiHost);
            
            log.info("Testing Booking API (apidojo-booking-v1)");
            log.info("URL: {}", url);
            log.info("Host: {}", rapidApiHost);
            log.info("Key: {}...", rapidApiKey.substring(0, 15));
            
            HttpEntity<String> entity = new HttpEntity<>(headers);
            ResponseEntity<String> response = restTemplate.exchange(
                url, HttpMethod.GET, entity, String.class);
            
            result.put("status", "SUCCESS");
            result.put("httpStatus", response.getStatusCode().value());
            result.put("responseLength", response.getBody() != null ? response.getBody().length() : 0);
            result.put("host", rapidApiHost);
            result.put("endpoint", "/properties/list-by-map");
            
            if (response.getBody() != null && response.getBody().length() > 0) {
                String preview = response.getBody().substring(0, Math.min(500, response.getBody().length()));
                result.put("preview", preview);
            }
            result.put("message", "Booking.com API (apidojo-booking-v1) is responding");
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            result.put("status", "ERROR");
            result.put("error", e.getClass().getSimpleName());
            result.put("message", e.getMessage());
            result.put("host", rapidApiHost);
            result.put("suggestion", determineErrorSuggestion(e.getMessage()));
            
            log.error("Booking API health check failed: {} - {}", 
                e.getClass().getSimpleName(), e.getMessage());
            
            return ResponseEntity.status(500).body(result);
        }
    }
    
    private String determineErrorSuggestion(String errorMsg) {
        if (errorMsg == null) return "Unknown error";
        if (errorMsg.contains("401")) return "Invalid RapidAPI key - please check your credentials";
        if (errorMsg.contains("403")) return "API access forbidden - check your RapidAPI subscription";
        if (errorMsg.contains("429")) return "Rate limit exceeded - wait before retrying";
        if (errorMsg.contains("404")) return "Endpoint not found - check the API URL";
        return "Network or API error - check logs for details";
    }
}
