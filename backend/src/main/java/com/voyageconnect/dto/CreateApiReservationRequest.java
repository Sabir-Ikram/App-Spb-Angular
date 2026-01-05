package com.voyageconnect.dto;

import com.voyageconnect.model.ReservationType;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class CreateApiReservationRequest {
    private ReservationType type;
    private FlightReservationData flight;
    private HotelReservationData hotel;

    @Data
    public static class FlightReservationData {
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
    public static class HotelReservationData {
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
