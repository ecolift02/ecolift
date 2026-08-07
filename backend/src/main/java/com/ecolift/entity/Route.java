package com.ecolift.entity;

import java.math.BigDecimal;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "routes")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Route {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Starting Location
    @Column(nullable = false, columnDefinition = "TEXT")
    private String departureLocationName;

    @Column(nullable = false, precision = 10, scale = 8)
    private BigDecimal startLatitude;

    @Column(nullable = false, precision = 11, scale = 8)
    private BigDecimal startLongitude;

    // Destination
    @Column(nullable = false, columnDefinition = "TEXT")
    private String arrivalLocationName;

    @Column(nullable = false, precision = 10, scale = 8)
    private BigDecimal endLatitude;

    @Column(nullable = false, precision = 11, scale = 8)
    private BigDecimal endLongitude;

    // Route Details
    @Column(nullable = false)
    private Double distanceKm;

    // Encoded polyline returned by the routing API
    @Column(nullable = false, columnDefinition = "TEXT")
    private String polyline;
}