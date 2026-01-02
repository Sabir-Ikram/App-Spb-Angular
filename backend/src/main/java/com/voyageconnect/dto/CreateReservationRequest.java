package com.voyageconnect.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CreateReservationRequest {
    private Long flightId;
    private Long hotelId;
    private LocalDateTime date;
}
