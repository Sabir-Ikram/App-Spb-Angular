package com.voyageconnect.service;

import com.voyageconnect.dto.ApiReservationResponse;
import com.voyageconnect.dto.CreateApiReservationRequest;
import com.voyageconnect.model.*;
import com.voyageconnect.repository.ApiReservationRepository;
import com.voyageconnect.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
public class ApiReservationService {

    private final ApiReservationRepository reservationRepository;
    private final UserRepository userRepository;

    public ApiReservationService(ApiReservationRepository reservationRepository, 
                                 UserRepository userRepository) {
        this.reservationRepository = reservationRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public ApiReservationResponse createReservation(CreateApiReservationRequest request) {
        // Get authenticated user
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Calculate total price
        BigDecimal totalPrice = BigDecimal.ZERO;
        if (request.getFlight() != null && request.getFlight().getPrice() != null) {
            totalPrice = totalPrice.add(request.getFlight().getPrice());
        }
        if (request.getHotel() != null && request.getHotel().getTotalPrice() != null) {
            totalPrice = totalPrice.add(request.getHotel().getTotalPrice());
        }

        // Create reservation
        ApiReservation reservation = ApiReservation.builder()
                .user(user)
                .type(request.getType())
                .status(ReservationStatus.PENDING)
                .totalPrice(totalPrice)
                .build();

        // Add flight details if present
        if (request.getFlight() != null) {
            ReservationFlight flightDetails = mapFlightData(request.getFlight());
            flightDetails.setReservation(reservation);
            reservation.setFlightDetails(flightDetails);
        }

        // Add hotel details if present
        if (request.getHotel() != null) {
            ReservationHotel hotelDetails = mapHotelData(request.getHotel());
            hotelDetails.setReservation(reservation);
            reservation.setHotelDetails(hotelDetails);
        }

        // Save reservation
        reservation = reservationRepository.save(reservation);
        
        log.info("✓ Created reservation {} for user {} - Type: {}, Total: ${}", 
                reservation.getId(), user.getEmail(), reservation.getType(), totalPrice);

        return toResponse(reservation);
    }

    public List<ApiReservationResponse> getUserReservations() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return reservationRepository.findByUserId(user.getId()).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<ApiReservationResponse> getAllReservations() {
        return reservationRepository.findAllOrderByCreatedAtDesc().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ApiReservationResponse updateStatus(Long id, ReservationStatus newStatus) {
        ApiReservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));

        reservation.setStatus(newStatus);
        reservation = reservationRepository.save(reservation);

        log.info("✓ Updated reservation {} status to {}", id, newStatus);

        return toResponse(reservation);
    }

    public ApiReservationResponse getReservation(Long id) {
        ApiReservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));
        return toResponse(reservation);
    }

    private ReservationFlight mapFlightData(CreateApiReservationRequest.FlightReservationData data) {
        return ReservationFlight.builder()
                .externalFlightId(data.getExternalFlightId())
                .origin(data.getOrigin())
                .destination(data.getDestination())
                .departureDate(data.getDepartureDate())
                .returnDate(data.getReturnDate())
                .airline(data.getAirline())
                .flightNumber(data.getFlightNumber())
                .price(data.getPrice())
                .passengers(data.getPassengers())
                .itinerary(data.getItinerary())
                .build();
    }

    private ReservationHotel mapHotelData(CreateApiReservationRequest.HotelReservationData data) {
        return ReservationHotel.builder()
                .externalHotelId(data.getExternalHotelId())
                .hotelName(data.getHotelName())
                .city(data.getCity())
                .address(data.getAddress())
                .checkIn(data.getCheckIn())
                .checkOut(data.getCheckOut())
                .roomCount(data.getRoomCount())
                .pricePerNight(data.getPricePerNight())
                .totalPrice(data.getTotalPrice())
                .nights(data.getNights())
                .rating(data.getRating())
                .imageUrl(data.getImageUrl())
                .build();
    }

    private ApiReservationResponse toResponse(ApiReservation reservation) {
        ApiReservationResponse.ApiReservationResponseBuilder builder = ApiReservationResponse.builder()
                .id(reservation.getId())
                .userId(reservation.getUser().getId())
                .userEmail(reservation.getUser().getEmail())
                .type(reservation.getType())
                .status(reservation.getStatus())
                .totalPrice(reservation.getTotalPrice())
                .createdAt(reservation.getCreatedAt());

        if (reservation.getFlightDetails() != null) {
            ReservationFlight f = reservation.getFlightDetails();
            builder.flight(ApiReservationResponse.FlightDetails.builder()
                    .id(f.getId())
                    .externalFlightId(f.getExternalFlightId())
                    .origin(f.getOrigin())
                    .destination(f.getDestination())
                    .departureDate(f.getDepartureDate())
                    .returnDate(f.getReturnDate())
                    .airline(f.getAirline())
                    .flightNumber(f.getFlightNumber())
                    .price(f.getPrice())
                    .passengers(f.getPassengers())
                    .itinerary(f.getItinerary())
                    .build());
        }

        if (reservation.getHotelDetails() != null) {
            ReservationHotel h = reservation.getHotelDetails();
            builder.hotel(ApiReservationResponse.HotelDetails.builder()
                    .id(h.getId())
                    .externalHotelId(h.getExternalHotelId())
                    .hotelName(h.getHotelName())
                    .city(h.getCity())
                    .address(h.getAddress())
                    .checkIn(h.getCheckIn())
                    .checkOut(h.getCheckOut())
                    .roomCount(h.getRoomCount())
                    .pricePerNight(h.getPricePerNight())
                    .totalPrice(h.getTotalPrice())
                    .nights(h.getNights())
                    .rating(h.getRating())
                    .imageUrl(h.getImageUrl())
                    .build());
        }

        return builder.build();
    }
}
