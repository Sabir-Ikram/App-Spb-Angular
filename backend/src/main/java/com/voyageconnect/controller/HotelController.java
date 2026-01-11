package com.voyageconnect.controller;

import com.voyageconnect.dto.HotelCreateDTO;
import com.voyageconnect.dto.HotelDTO;
import com.voyageconnect.model.Destination;
import com.voyageconnect.model.Hotel;
import com.voyageconnect.repository.DestinationRepository;
import com.voyageconnect.repository.HotelRepository;
import com.voyageconnect.service.AmadeusHotelService;
import com.voyageconnect.service.BookingApiService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/hotels")
@CrossOrigin(origins = "*", maxAge = 3600)
@Slf4j
public class HotelController {

    private final HotelRepository hotelRepository;
    private final DestinationRepository destinationRepository;
    private final BookingApiService bookingApiService;
    private final AmadeusHotelService amadeusHotelService;

    public HotelController(HotelRepository hotelRepository, 
                          DestinationRepository destinationRepository,
                          BookingApiService bookingApiService,
                          AmadeusHotelService amadeusHotelService) {
        this.hotelRepository = hotelRepository;
        this.destinationRepository = destinationRepository;
        this.bookingApiService = bookingApiService;
        this.amadeusHotelService = amadeusHotelService;
    }

    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> list(@RequestParam(required = false) String city) {
        try {
            // Default to Paris if no city specified
            String cityName = city != null ? city : "Paris";
            
            log.info("✓ Fetching hotels for city: {}", cityName);
            
            String hotelsJson;
            
            // Route based on city: Morocco → Amadeus, Others → Booking.com
            if (amadeusHotelService.isMoroccanCity(cityName)) {
                log.info("→ Routing to AMADEUS for Moroccan city: {}", cityName);
                hotelsJson = amadeusHotelService.searchHotels(cityName);
            } else {
                log.info("→ Routing to BOOKING.COM for city: {}", cityName);
                hotelsJson = bookingApiService.getHotelsByCity(cityName);
            }
            
            return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(hotelsJson);
            
        } catch (Exception e) {
            log.error("✗ Error in hotel controller: {}", e.getMessage());
            return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body("{\"result\":[],\"count\":0}");
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<HotelDTO> get(@PathVariable Long id) {
        return hotelRepository.findById(id).map(h -> ResponseEntity.ok(toDto(h))).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<HotelDTO> create(@RequestBody HotelCreateDTO dto) {
        Destination dest = destinationRepository.findById(dto.getDestinationId()).orElse(null);
        if (dest == null) return ResponseEntity.badRequest().build();

        Hotel h = Hotel.builder()
                .name(dto.getName())
                .pricePerNight(dto.getPricePerNight())
                .availableRooms(dto.getAvailableRooms())
                .destination(dest)
                .build();

        Hotel saved = hotelRepository.save(h);
        return ResponseEntity.created(URI.create("/api/hotels/" + saved.getId())).body(toDto(saved));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<HotelDTO> update(@PathVariable Long id, @RequestBody HotelCreateDTO dto) {
        return hotelRepository.findById(id).map(h -> {
            h.setName(dto.getName());
            h.setPricePerNight(dto.getPricePerNight());
            h.setAvailableRooms(dto.getAvailableRooms());
            destinationRepository.findById(dto.getDestinationId()).ifPresent(h::setDestination);
            Hotel updated = hotelRepository.save(h);
            return ResponseEntity.ok(toDto(updated));
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        return hotelRepository.findById(id).map(h -> {
            hotelRepository.delete(h);
            return ResponseEntity.noContent().<Void>build();
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    private HotelDTO toDto(Hotel h) {
        return new HotelDTO(
            h.getId(), 
            h.getName(), 
            h.getPricePerNight(), 
            h.getAvailableRooms(), 
            h.getDestination() != null ? h.getDestination().getId() : null,
            h.getAddress(),
            h.getRating(),
            h.getImageUrl(),
            h.getDescription()
        );
    }
}
