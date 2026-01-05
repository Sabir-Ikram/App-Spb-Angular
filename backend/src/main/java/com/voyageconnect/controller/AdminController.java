package com.voyageconnect.controller;

import com.voyageconnect.model.Destination;
import com.voyageconnect.model.Flight;
import com.voyageconnect.service.DestinationImportService;
import com.voyageconnect.service.FlightImportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final DestinationImportService destinationImportService;
    private final FlightImportService flightImportService;

    @PostMapping("/import-destinations")
    public ResponseEntity<?> importDestinations() {
        try {
            List<Destination> imported = destinationImportService.importDestinations();
            return ResponseEntity.ok(Map.of(
                    "message", "Destinations imported successfully",
                    "count", imported.size(),
                    "destinations", imported
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to import destinations: " + e.getMessage()));
        }
    }

    @PostMapping("/import-flights")
    public ResponseEntity<?> importFlights() {
        try {
            List<Flight> imported = flightImportService.importFlights();
            return ResponseEntity.ok(Map.of(
                    "message", "Flights imported successfully",
                    "count", imported.size(),
                    "flights", imported
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to import flights: " + e.getMessage()));
        }
    }

    @DeleteMapping("/clear-flights")
    public ResponseEntity<?> clearFlights() {
        try {
            flightImportService.clearAllFlights();
            return ResponseEntity.ok(Map.of("message", "All flights cleared successfully"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to clear flights: " + e.getMessage()));
        }
    }
}
