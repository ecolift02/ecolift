package com.ecolift.dto.request;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RideUpdateRequest {
 
    @NotNull(message = "Departure time is required")
    @Future(message = "Departure time must be in the future")
    private LocalDateTime departureTime;
 
    @Future(message = "Estimated arrival time must be in the future")
    private LocalDateTime estimateArrivalTime;
 
    @NotNull(message = "Available seats are required")
    @Min(value = 1, message = "Must offer at least 1 seat")
    private Integer availableSeats;
 
    @NotNull(message = "Price per seat is required")
    @Min(value = 0, message = "Price cannot be negative")
    private BigDecimal pricePerSeat;
}
