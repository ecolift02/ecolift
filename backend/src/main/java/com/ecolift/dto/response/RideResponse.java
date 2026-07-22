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
    
    // Updated from a single String to match your Location entity details
    private String departureLocationName; 
    private String arrivalLocationName;
    
    private LocalDateTime departureTime;
    private LocalDateTime estimateArrivalTime; // Added to match your Ride entity
    private Integer availableSeats;
    private BigDecimal pricePerSeat;
    private Boolean isDeleted; // Added to match your Ride entity's deletion flag
}
