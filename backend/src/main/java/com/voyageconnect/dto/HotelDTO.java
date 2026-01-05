package com.voyageconnect.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class HotelDTO {
    private Long id;
    private String name;
    private BigDecimal pricePerNight;
    private Integer availableRooms;
    private Long destinationId;
    private String address;
    private Integer rating;
    private String imageUrl;
    private String description;
}
