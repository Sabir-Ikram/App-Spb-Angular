package com.voyageconnect.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FlightDTO {
    private Long id;
    private LocalDateTime departure;
    private LocalDateTime arrival;
    private BigDecimal price;
    private Integer availableSeats;
    private Long destinationId;
}
