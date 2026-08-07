package com.ecolift.dto.request;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class RidePublishRequest {

    @NotNull(message = "Vehicle ID is required")
    private Long vehicleId;

    // -----------------------------
    // NEW ROUTE FIELDS
    // -----------------------------

    @NotNull(message = "Start address is required")
    private String startAddress;

    @NotNull(message = "Start latitude is required")
    private BigDecimal startLatitude;

    @NotNull(message = "Start longitude is required")
    private BigDecimal startLongitude;

    @NotNull(message = "Destination address is required")
    private String endAddress;

    @NotNull(message = "Destination latitude is required")
    private BigDecimal endLatitude;

    @NotNull(message = "Destination longitude is required")
    private BigDecimal endLongitude;

    @NotNull(message = "Route distance is required")
    @DecimalMin(value = "0.1", message = "Distance must be greater than 0 km")
    private Double distanceKm;

    @NotBlank(message = "Route polyline is required")
    private String polyline;

    // -----------------------------
    // EXISTING FIELDS
    // -----------------------------

    @NotNull(message = "Departure time is required")
    @Future(message = "Departure time must be in the future")
    private LocalDateTime departureTime;

    @Future(message = "Estimated arrival time must be in the future")
    private LocalDateTime estimateArrivalTime;

    @NotNull(message = "Available seats are required")
    @Min(value = 1, message = "Must offer at least 1 seat")
    private Integer availableSeats;

    @NotNull(message = "Price per seat is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Price per seat cannot be negative")
    private BigDecimal pricePerSeat;
}