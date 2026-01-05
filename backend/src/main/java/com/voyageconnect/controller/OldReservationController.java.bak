package com.voyageconnect.controller;

import com.voyageconnect.dto.CreateReservationRequest;
import com.voyageconnect.dto.ReservationDTO;
import com.voyageconnect.model.*;
import com.voyageconnect.repository.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/reservations")
public class ReservationController {

    private final ReservationRepository reservationRepository;
    private final UserRepository userRepository;
    private final FlightRepository flightRepository;
    private final HotelRepository hotelRepository;

    public ReservationController(ReservationRepository reservationRepository, UserRepository userRepository, FlightRepository flightRepository, HotelRepository hotelRepository) {
        this.reservationRepository = reservationRepository;
        this.userRepository = userRepository;
        this.flightRepository = flightRepository;
        this.hotelRepository = hotelRepository;
    }

    @GetMapping
    public List<ReservationDTO> listForUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow();
        return reservationRepository.findByUserId(user.getId()).stream().map(this::toDto).collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ReservationDTO> get(@PathVariable Long id) {
        return reservationRepository.findById(id).map(r -> ResponseEntity.ok(toDto(r))).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<ReservationDTO> create(@RequestBody CreateReservationRequest req) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow();

        Flight flight = null;
        if (req.getFlightId() != null) {
            flight = flightRepository.findById(req.getFlightId()).orElse(null);
            if (flight == null) return ResponseEntity.badRequest().build();
            if (flight.getAvailableSeats() != null && flight.getAvailableSeats() <= 0) return ResponseEntity.badRequest().body(null);
        }

        Hotel hotel = null;
        if (req.getHotelId() != null) {
            hotel = hotelRepository.findById(req.getHotelId()).orElse(null);
            if (hotel == null) return ResponseEntity.badRequest().build();
            if (hotel.getAvailableRooms() != null && hotel.getAvailableRooms() <= 0) return ResponseEntity.badRequest().body(null);
        }

        java.math.BigDecimal total = java.math.BigDecimal.ZERO;
        if (flight != null && flight.getPrice() != null) total = total.add(flight.getPrice());
        if (hotel != null && hotel.getPricePerNight() != null) total = total.add(hotel.getPricePerNight());

        Reservation res = Reservation.builder()
                .date(req.getDate() != null ? req.getDate() : LocalDateTime.now())
                .status(ReservationStatus.CREATED)
                .totalPrice(total)
                .user(user)
                .flight(flight)
                .hotel(hotel)
                .build();

        // decrement availability
        if (flight != null && flight.getAvailableSeats() != null) {
            flight.setAvailableSeats(flight.getAvailableSeats() - 1);
            flightRepository.save(flight);
        }
        if (hotel != null && hotel.getAvailableRooms() != null) {
            hotel.setAvailableRooms(hotel.getAvailableRooms() - 1);
            hotelRepository.save(hotel);
        }

        Reservation saved = reservationRepository.save(res);
        return ResponseEntity.created(URI.create("/api/reservations/" + saved.getId())).body(toDto(saved));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancel(@PathVariable Long id) {
        return reservationRepository.findById(id).map(r -> {
            r.setStatus(ReservationStatus.CANCELLED);
            reservationRepository.save(r);
            return ResponseEntity.noContent().<Void>build();
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/all")
    public List<ReservationDTO> listAll() {
        return reservationRepository.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    private ReservationDTO toDto(Reservation r) {
        return new ReservationDTO(r.getId(), r.getDate(), r.getStatus(), r.getTotalPrice(), r.getUser() != null ? r.getUser().getId() : null,
                r.getFlight() != null ? r.getFlight().getId() : null,
                r.getHotel() != null ? r.getHotel().getId() : null);
    }
}
