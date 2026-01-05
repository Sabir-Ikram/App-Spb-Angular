package com.voyageconnect.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.Base64;

@Service
@Slf4j
public class AmadeusAuthService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${amadeus.api.key}")
    private String apiKey;

    @Value("${amadeus.api.secret}")
    private String apiSecret;

    private static final String AMADEUS_AUTH_URL = "https://test.api.amadeus.com/v1/security/oauth2/token";
    private static final String GRANT_TYPE = "client_credentials";

    private String cachedAccessToken;
    private long tokenExpiryTime;

    public AmadeusAuthService(RestTemplate restTemplate, ObjectMapper objectMapper) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
    }

    /**
     * Get valid access token, using cache if not expired
     * If cache is about to expire (within 30 seconds), refresh proactively
     */
    public String getAccessToken() throws Exception {
        // If token is not cached or expired, generate new one
        if (cachedAccessToken == null || System.currentTimeMillis() >= tokenExpiryTime) {
            log.debug("Token not cached or expired, requesting new token");
            return generateNewToken();
        }
        
        // If token expires soon (within 30 seconds), refresh it
        long timeUntilExpiry = tokenExpiryTime - System.currentTimeMillis();
        if (timeUntilExpiry < 30000) {
            log.debug("Token expires in {} ms, refreshing proactively", timeUntilExpiry);
            return generateNewToken();
        }
        
        log.debug("Using cached Amadeus access token, expires in {} seconds", timeUntilExpiry / 1000);
        return cachedAccessToken;
    }

    /**
     * Generate new OAuth2 token from Amadeus
     * Automatically retries token generation if current cached token fails authentication
     */
    private synchronized String generateNewToken() throws Exception {
        // Double-check after acquiring lock - another thread may have just refreshed
        long timeUntilExpiry = tokenExpiryTime - System.currentTimeMillis();
        if (cachedAccessToken != null && timeUntilExpiry > 30000) {
            log.debug("Another thread already refreshed token");
            return cachedAccessToken;
        }

        try {
            log.info("Generating new Amadeus OAuth2 token...");
            log.info("API Key: {}", apiKey.substring(0, Math.min(15, apiKey.length())));
            log.info("API Secret length: {}", apiSecret.length());
            log.info("OAuth2 endpoint: {}", AMADEUS_AUTH_URL);
            
            String requestBody = String.format(
                "grant_type=%s&client_id=%s&client_secret=%s",
                GRANT_TYPE, apiKey, apiSecret
            );
            log.debug("Request body: {}", requestBody);

            String response = restTemplate.postForObject(
                AMADEUS_AUTH_URL,
                createAuthRequest(requestBody),
                String.class
            );
            
            log.info("Token response received, parsing...");
            JsonNode jsonNode = objectMapper.readTree(response);
            
            // Check for error in response
            if (jsonNode.has("errors")) {
                log.error("Amadeus API error in token response: {}", jsonNode.get("errors"));
                throw new RuntimeException("Amadeus API error: " + jsonNode.get("errors"));
            }
            
            String accessToken = jsonNode.get("access_token").asText();
            long expiresIn = jsonNode.get("expires_in").asLong();

            cachedAccessToken = accessToken;
            // Refresh 30 seconds before expiry for proactive refresh
            tokenExpiryTime = System.currentTimeMillis() + (expiresIn * 1000) - 30000;

            log.info("✓ Successfully obtained new Amadeus OAuth2 token");
            log.info("  Token length: {} chars", accessToken.length());
            log.info("  Valid for {} seconds", expiresIn);
            log.info("  Will refresh automatically at {}ms", tokenExpiryTime);
            
            return accessToken;

        } catch (Exception e) {
            log.error("✗ Failed to obtain Amadeus OAuth2 token: {}", e.getMessage());
            cachedAccessToken = null;
            tokenExpiryTime = 0;
            throw new RuntimeException("Amadeus authentication failed: " + e.getMessage(), e);
        }
    }

    /**
     * Create auth request body
     */
    private org.springframework.http.HttpEntity<?> createAuthRequest(String body) {
        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        return new org.springframework.http.HttpEntity<>(body, headers);
    }

    /**
     * Invalidate cached token (for testing or manual refresh)
     */
    public void invalidateToken() {
        cachedAccessToken = null;
        tokenExpiryTime = 0;
        log.info("Amadeus access token invalidated");
    }
}
