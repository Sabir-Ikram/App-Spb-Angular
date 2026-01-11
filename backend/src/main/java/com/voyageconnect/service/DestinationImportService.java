package com.voyageconnect.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.voyageconnect.model.Destination;
import com.voyageconnect.repository.DestinationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class DestinationImportService {

    private final DestinationRepository destinationRepository;
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    // Popular tourist cities by country
    private static final List<CityCountry> POPULAR_CITIES = List.of(
            new CityCountry("Paris", "France"),
            new CityCountry("Tokyo", "Japan"),
            new CityCountry("New York", "United States"),
            new CityCountry("Barcelona", "Spain"),
            new CityCountry("Dubai", "United Arab Emirates"),
            new CityCountry("Rome", "Italy"),
            new CityCountry("London", "United Kingdom"),
            new CityCountry("Bangkok", "Thailand"),
            new CityCountry("Singapore", "Singapore"),
            new CityCountry("Istanbul", "Turkey"),
            new CityCountry("Amsterdam", "Netherlands"),
            new CityCountry("Prague", "Czech Republic"),
            new CityCountry("Sydney", "Australia"),
            new CityCountry("Cairo", "Egypt"),
            new CityCountry("Rio de Janeiro", "Brazil"),
            new CityCountry("Cancun", "Mexico"),
            new CityCountry("Bali", "Indonesia"),
            // Moroccan cities - naturally integrated with other destinations
            new CityCountry("Casablanca", "Morocco"),
            new CityCountry("Marrakech", "Morocco"),
            new CityCountry("Rabat", "Morocco"),
            new CityCountry("Fes", "Morocco"),
            new CityCountry("Tangier", "Morocco"),
            new CityCountry("Agadir", "Morocco"),
            new CityCountry("Athens", "Greece"),
            new CityCountry("Vienna", "Austria")
    );

    @Transactional
    public List<Destination> importDestinations() {
        log.info("Starting destination import from REST Countries API");
        List<Destination> importedDestinations = new ArrayList<>();

        for (CityCountry cityCountry : POPULAR_CITIES) {
            try {
                String countryName = cityCountry.country();
                String cityName = cityCountry.city();

                // Fetch country info from REST Countries API
                String url = "https://restcountries.com/v3.1/name/" + countryName + "?fullText=true";
                String response = restTemplate.getForObject(url, String.class);
                JsonNode countryData = objectMapper.readTree(response).get(0);

                // Extract country information
                String officialName = countryData.get("name").get("official").asText();
                String region = countryData.get("region").asText();
                String capital = countryData.has("capital") ? countryData.get("capital").get(0).asText() : "";
                
                // Build description
                String description = String.format(
                        "%s is a popular tourist destination in %s, %s. Known for its rich culture, historical landmarks, and vibrant atmosphere. " +
                        "Visit to experience unique local cuisine, stunning architecture, and unforgettable experiences.",
                        cityName, officialName, region
                );

                // Check if destination already exists
                if (destinationRepository.findByCityAndCountry(cityName, officialName).isEmpty()) {
                    Destination destination = Destination.builder()
                            .city(cityName)
                            .country(officialName)
                            .description(description)
                            .build();

                    destinationRepository.save(destination);
                    importedDestinations.add(destination);
                    log.info("Imported destination: {} - {}", cityName, officialName);
                } else {
                    log.info("Destination already exists: {} - {}", cityName, officialName);
                }

                // Sleep to avoid rate limiting
                Thread.sleep(100);

            } catch (Exception e) {
                log.error("Failed to import destination: {} - {}", cityCountry.city(), cityCountry.country(), e);
            }
        }

        log.info("Destination import completed. Imported {} new destinations", importedDestinations.size());
        return importedDestinations;
    }

    private record CityCountry(String city, String country) {}
}
