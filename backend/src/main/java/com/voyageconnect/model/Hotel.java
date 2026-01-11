package com.voyageconnect.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "hotels")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Hotel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private BigDecimal pricePerNight;

    private Integer availableRooms;

    private String address;

    private Integer rating;

    private String imageUrl;

    @Column(length = 1000)
    private String description;

    @Column(length = 50)
    private String provider; // "AMADEUS" or "BOOKING_COM"

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "destination_id")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Destination destination;
}
