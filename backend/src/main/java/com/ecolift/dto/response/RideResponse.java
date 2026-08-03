package com.ecolift.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class RideResponse {

    private Long rideId;

    private String driverName;

    private String vehicleModel;

    private String vehicleLicensePlate;

    // Existing Fields (keep these)
    private String departureLocationName;

    private String arrivalLocationName;

    private BigDecimal startLatitude;

    private BigDecimal startLongitude;

    private BigDecimal endLatitude;

    private BigDecimal endLongitude;

    private Double distanceKm;

    private String polyline;

    private LocalDateTime departureTime;

    private LocalDateTime arrivalTime;

    private Integer availableSeats;

    private BigDecimal pricePerSeat;

    private Boolean isDeleted;
}