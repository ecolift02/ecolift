package com.ecolift.dto.request;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class RidePublishRequest {

    @NotNull(message = "Vehicle ID is required")
    private Long vehicleId;

    @NotNull(message = "Source location ID is required")
    private Long sourceLocationId;

    @NotNull(message = "Destination location ID is required")
    private Long destinationLocationId;

    @NotNull(message = "Departure time is required")
    @Future(message = "Departure time must be in the future")
    private LocalDateTime departureTime;

    // Optional: Let the user provide an estimated arrival time if they want to
    @Future(message = "Estimated arrival time must be in the future")
    private LocalDateTime estimateArrivalTime;

    @NotNull(message = "Available seats are required")
    @Min(value = 1, message = "Must offer at least 1 seat")
    private Integer availableSeats;

    @NotNull(message = "Price per seat is required")
    @Min(value = 0, message = "Price cannot be negative")
    private BigDecimal pricePerSeat;
}