package com.voyageconnect.controller;

import com.voyageconnect.dto.DestinationCreateDTO;
import com.voyageconnect.dto.DestinationDTO;
import com.voyageconnect.model.Destination;
import com.voyageconnect.repository.DestinationRepository;
import com.voyageconnect.service.AmadeusClientService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/destinations")
public class DestinationController {

    private final DestinationRepository destinationRepository;
    private final AmadeusClientService amadeusClientService;

    public DestinationController(DestinationRepository destinationRepository, AmadeusClientService amadeusClientService) {
        this.destinationRepository = destinationRepository;
        this.amadeusClientService = amadeusClientService;
    }

    @GetMapping
    public List<Map<String, Object>> list(@RequestParam(required = false) String keyword) {
        // Return only Amadeus API destinations
        if (keyword == null || keyword.isEmpty()) {
            // Search for popular cities including Moroccan destinations if no keyword provided
            List<Map<String, Object>> allDestinations = new ArrayList<>();
            String[] popularCities = {
                "Paris", "London", "New York", "Tokyo", "Dubai", "Barcelona", "Rome", "Amsterdam", 
                // Moroccan cities - naturally integrated
                "Casablanca", "Marrakech", "Rabat", "Fes", "Tangier", "Agadir", 
                "Madrid", "Berlin", "Singapore"
            };
            for (String city : popularCities) {
                List<Map<String, Object>> cityDests = amadeusClientService.searchDestinations(city);
                if (!cityDests.isEmpty()) {
                    allDestinations.addAll(cityDests);
                }
                if (allDestinations.size() >= 50) break; // Limit results
            }
            return allDestinations;
        }
        
        // For typed searches, query Amadeus API directly
        // This naturally supports Moroccan cities like "Casa", "Marrakech", etc.
        return amadeusClientService.searchDestinations(keyword);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DestinationDTO> get(@PathVariable Long id) {
        return destinationRepository.findById(id).map(d -> ResponseEntity.ok(toDto(d))).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<DestinationDTO> create(@RequestBody DestinationCreateDTO dto) {
        Destination dest = Destination.builder()
                .country(dto.getCountry())
                .city(dto.getCity())
                .description(dto.getDescription())
                .build();

        Destination saved = destinationRepository.save(dest);
        return ResponseEntity.created(URI.create("/api/destinations/" + saved.getId())).body(toDto(saved));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<DestinationDTO> update(@PathVariable Long id, @RequestBody DestinationCreateDTO dto) {
        return destinationRepository.findById(id).map(d -> {
            d.setCountry(dto.getCountry());
            d.setCity(dto.getCity());
            d.setDescription(dto.getDescription());
            Destination updated = destinationRepository.save(d);
            return ResponseEntity.ok(toDto(updated));
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        return destinationRepository.findById(id).map(d -> {
            destinationRepository.delete(d);
            return ResponseEntity.noContent().<Void>build();
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    private DestinationDTO toDto(Destination d) {
        return new DestinationDTO(d.getId(), d.getCountry(), d.getCity(), d.getDescription());
    }
}
