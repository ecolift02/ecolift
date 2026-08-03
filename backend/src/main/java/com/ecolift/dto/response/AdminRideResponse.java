package com.ecolift.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Used by the Admin Management Module (Module 4 - Ride Monitoring).
 *
 * The Ride entity has no persisted status column (only an isDeleted flag), so
 * "status" here is computed at read time: CANCELLED (isDeleted), COMPLETED
 * (departure time has passed), or ACTIVE (upcoming, not cancelled). This is
 * read-only/derived and does not change how Ride itself is stored.
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AdminRideResponse {
    private Long rideId;
    private Long driverId;
    private String driverName;
    private Long vehicleId;
    private String vehicleModel;
    private String vehicleLicensePlate;
    private String departureLocationName;
    private String arrivalLocationName;
    private LocalDateTime departureTime;
    private LocalDateTime estimateArrivalTime;
    private Integer availableSeats;
    private BigDecimal pricePerSeat;

    // One of: ACTIVE, COMPLETED, CANCELLED
    private String rideStatus;
}
