package com.voyageconnect.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class FlightCreateDTO {
    private LocalDateTime departure;
    private LocalDateTime arrival;
    private BigDecimal price;
    private Integer availableSeats;
    private Long destinationId;
}
