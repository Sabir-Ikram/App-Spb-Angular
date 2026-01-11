package com.voyageconnect.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "reservation_flights")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReservationFlight {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reservation_id", nullable = false)
    private ApiReservation reservation;

    private String externalFlightId; // Amadeus offer ID
    
    @Column(nullable = false)
    private String origin;
    
    @Column(nullable = false)
    private String destination;
    
    @Column(nullable = false)
    private LocalDate departureDate;
    
    private LocalDate returnDate;
    
    private String airline;
    
    private String flightNumber;
    
    @Column(nullable = false)
    private BigDecimal price;
    
    private Integer passengers;
    
    @Column(length = 2000)
    private String itinerary; // JSON string with full flight details
}
