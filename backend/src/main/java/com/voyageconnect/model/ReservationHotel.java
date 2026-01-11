package com.voyageconnect.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "reservation_hotels")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReservationHotel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reservation_id", nullable = false)
    private ApiReservation reservation;

    private String externalHotelId; // Booking.com hotel ID
    
    @Column(nullable = false)
    private String hotelName;
    
    @Column(nullable = false)
    private String city;
    
    private String address;
    
    @Column(nullable = false)
    private LocalDate checkIn;
    
    @Column(nullable = false)
    private LocalDate checkOut;
    
    @Column(nullable = false)
    private Integer roomCount;
    
    @Column(nullable = false)
    private BigDecimal pricePerNight;
    
    @Column(nullable = false)
    private BigDecimal totalPrice;
    
    private Integer nights;
    
    private Double rating;
    
    @Column(length = 500)
    private String imageUrl;
}
