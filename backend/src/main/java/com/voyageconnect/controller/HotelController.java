package com.voyageconnect.controller;

import com.voyageconnect.dto.HotelCreateDTO;
import com.voyageconnect.dto.HotelDTO;
import com.voyageconnect.model.Destination;
import com.voyageconnect.model.Hotel;
import com.voyageconnect.repository.DestinationRepository;
import com.voyageconnect.repository.HotelRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/hotels")
public class HotelController {

    private final HotelRepository hotelRepository;
    private final DestinationRepository destinationRepository;

    public HotelController(HotelRepository hotelRepository, DestinationRepository destinationRepository) {
        this.hotelRepository = hotelRepository;
        this.destinationRepository = destinationRepository;
    }

    @GetMapping
    public List<HotelDTO> list(@RequestParam(required = false) Long destinationId) {
        List<Hotel> hotels = (destinationId == null) ? hotelRepository.findAll() : hotelRepository.findByDestinationId(destinationId);
        return hotels.stream().map(this::toDto).collect(Collectors.toList());
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
        return new HotelDTO(h.getId(), h.getName(), h.getPricePerNight(), h.getAvailableRooms(), h.getDestination() != null ? h.getDestination().getId() : null);
    }
}
