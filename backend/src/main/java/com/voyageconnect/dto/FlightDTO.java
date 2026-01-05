package com.voyageconnect.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FlightDTO {
    private Long id;
    private String departure;
    private String arrival;
    private BigDecimal price;
    private Integer availableSeats;
    private Long destinationId;
    private String airline;
    private String flightNumber;
    private String imageUrl;
    
    // Constructor that accepts LocalDateTime and converts to String
    public FlightDTO(Long id, LocalDateTime departure, LocalDateTime arrival, 
                     BigDecimal price, Integer availableSeats, Long destinationId,
                     String airline, String flightNumber, String imageUrl) {
        this.id = id;
        this.departure = departure != null ? departure.toString() : null;
        this.arrival = arrival != null ? arrival.toString() : null;
        this.price = price;
        this.availableSeats = availableSeats;
        this.destinationId = destinationId;
        this.airline = airline;
        this.flightNumber = flightNumber;
        this.imageUrl = imageUrl;
    }
}
