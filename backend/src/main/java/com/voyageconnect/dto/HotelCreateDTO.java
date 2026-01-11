package com.voyageconnect.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class HotelCreateDTO {
    private String name;
    private BigDecimal pricePerNight;
    private Integer availableRooms;
    private Long destinationId;
}
