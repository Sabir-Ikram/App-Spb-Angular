package com.voyageconnect.dto;

import com.voyageconnect.model.ReservationStatus;
import com.voyageconnect.model.ReservationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApiReservationResponse {
    private Long id;
    private Long userId;
    private String userEmail;
    private ReservationType type;
    private ReservationStatus status;
    private BigDecimal totalPrice;
    private LocalDateTime createdAt;
    private FlightDetails flight;
    private HotelDetails hotel;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FlightDetails {
        private Long id;
        private String externalFlightId;
        private String origin;
        private String destination;
        private LocalDate departureDate;
        private LocalDate returnDate;
        private String airline;
        private String flightNumber;
        private BigDecimal price;
        private Integer passengers;
        private String itinerary;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class HotelDetails {
        private Long id;
        private String externalHotelId;
        private String hotelName;
        private String city;
        private String address;
        private LocalDate checkIn;
        private LocalDate checkOut;
        private Integer roomCount;
        private BigDecimal pricePerNight;
        private BigDecimal totalPrice;
        private Integer nights;
        private Double rating;
        private String imageUrl;
    }
}
