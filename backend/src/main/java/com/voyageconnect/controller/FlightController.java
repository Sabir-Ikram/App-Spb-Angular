package com.voyageconnect.controller;

import com.voyageconnect.dto.FlightCreateDTO;
import com.voyageconnect.dto.FlightDTO;
import com.voyageconnect.model.Destination;
import com.voyageconnect.model.Flight;
import com.voyageconnect.repository.DestinationRepository;
import com.voyageconnect.repository.FlightRepository;
import com.voyageconnect.service.AmadeusClientService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/flights")
@CrossOrigin(origins = "*", maxAge = 3600)
public class FlightController {

    private final FlightRepository flightRepository;
    private final DestinationRepository destinationRepository;
    private final AmadeusClientService amadeusClientService;

    public FlightController(FlightRepository flightRepository, DestinationRepository destinationRepository, AmadeusClientService amadeusClientService) {
        this.flightRepository = flightRepository;
        this.destinationRepository = destinationRepository;
        this.amadeusClientService = amadeusClientService;
    }

    @GetMapping
    public List<FlightDTO> list(
            @RequestParam(required = false) String origin,
            @RequestParam(required = false) String destination,
            @RequestParam(required = false) String departureDate,
            @RequestParam(required = false) Long destinationId) {
        
        // If search parameters provided, fetch from Amadeus API
        if (origin != null && destination != null && departureDate != null) {
            return amadeusClientService.searchFlights(origin, destination, departureDate);
        }
        
        // Default: return mock flights for demo
        return amadeusClientService.searchFlights("ORD", "LAX", "2026-01-25");
    }

    @GetMapping("/{id}")
    public ResponseEntity<FlightDTO> get(@PathVariable Long id) {
        return flightRepository.findById(id).map(f -> ResponseEntity.ok(toDto(f))).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<FlightDTO> create(@RequestBody FlightCreateDTO dto) {
        Destination destination = destinationRepository.findById(dto.getDestinationId()).orElse(null);
        if (destination == null) return ResponseEntity.badRequest().build();

        Flight f = Flight.builder()
                .departure(dto.getDeparture())
                .arrival(dto.getArrival())
                .price(dto.getPrice())
                .availableSeats(dto.getAvailableSeats())
                .destination(destination)
                .build();

        Flight saved = flightRepository.save(f);
        return ResponseEntity.created(URI.create("/api/flights/" + saved.getId())).body(toDto(saved));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<FlightDTO> update(@PathVariable Long id, @RequestBody FlightCreateDTO dto) {
        return flightRepository.findById(id).map(f -> {
            f.setDeparture(dto.getDeparture());
            f.setArrival(dto.getArrival());
            f.setPrice(dto.getPrice());
            f.setAvailableSeats(dto.getAvailableSeats());
            destinationRepository.findById(dto.getDestinationId()).ifPresent(f::setDestination);
            Flight updated = flightRepository.save(f);
            return ResponseEntity.ok(toDto(updated));
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        return flightRepository.findById(id).map(f -> {
            flightRepository.delete(f);
            return ResponseEntity.noContent().<Void>build();
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    private FlightDTO toDto(Flight f) {
        return new FlightDTO(
            f.getId(), 
            f.getDeparture(), 
            f.getArrival(), 
            f.getPrice(), 
            f.getAvailableSeats(), 
            f.getDestination() != null ? f.getDestination().getId() : null,
            f.getAirline(),
            f.getFlightNumber(),
            f.getImageUrl()
        );
    }
}
