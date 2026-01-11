package com.voyageconnect.controller;

import com.voyageconnect.dto.FlightDTO;
import com.voyageconnect.dto.HotelDTO;
import com.voyageconnect.service.AmadeusClientService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/amadeus")
@Slf4j
@CrossOrigin(origins = "*", maxAge = 3600)
public class AmadeusController {

    private final AmadeusClientService amadeusClientService;

    public AmadeusController(AmadeusClientService amadeusClientService) {
        this.amadeusClientService = amadeusClientService;
    }

    /**
     * Search destinations by keyword
     * GET /api/amadeus/destinations?keyword=Paris
     */
    @GetMapping("/destinations")
    public ResponseEntity<List<Map<String, Object>>> searchDestinations(
            @RequestParam String keyword) {
        log.info("Searching destinations with keyword: {}", keyword);
        List<Map<String, Object>> destinations = amadeusClientService.searchDestinations(keyword);
        return ResponseEntity.ok(destinations);
    }

    /**
     * Search flights
     * GET /api/amadeus/flights?origin=CDG&destination=LAX&departureDate=2026-02-15
     */
    @GetMapping("/flights")
    public ResponseEntity<List<FlightDTO>> searchFlights(
            @RequestParam String origin,
            @RequestParam String destination,
            @RequestParam String departureDate) {
        log.info("Searching flights: {} -> {} on {}", origin, destination, departureDate);
        List<FlightDTO> flights = amadeusClientService.searchFlights(origin, destination, departureDate);
        return ResponseEntity.ok(flights);
    }

    /**
     * Search hotels
     * GET /api/amadeus/hotels?cityCode=PAR&checkIn=2026-02-15&checkOut=2026-02-20
     */
    @GetMapping("/hotels")
    public ResponseEntity<List<HotelDTO>> searchHotels(
            @RequestParam String cityCode,
            @RequestParam String checkIn,
            @RequestParam String checkOut) {
        log.info("Searching hotels in {} from {} to {}", cityCode, checkIn, checkOut);
        List<HotelDTO> hotels = amadeusClientService.searchHotels(cityCode, checkIn, checkOut);
        return ResponseEntity.ok(hotels);
    }
}
