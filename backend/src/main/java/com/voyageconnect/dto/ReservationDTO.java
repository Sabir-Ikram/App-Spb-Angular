package com.voyageconnect.dto;

import com.voyageconnect.model.ReservationStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReservationDTO {
    private Long id;
    private LocalDateTime date;
    private ReservationStatus status;
    private BigDecimal totalPrice;
    private Long userId;
    private Long flightId;
    private Long hotelId;
}
