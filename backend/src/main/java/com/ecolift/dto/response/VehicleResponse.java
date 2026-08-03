package com.ecolift.dto.response;

import com.ecolift.entity.VehicleVerificationStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class VehicleResponse {
    private Long id;
    private String vehicleName;
    private String vehicleNumber;
    private String vehicleType;
    private String brand;
    private String model;
    private String color;
    private Integer seatCapacity;
    private String fuelType;
    private Integer manufacturingYear;
    private String registrationNumber;
    private String status;
    private Boolean isVerified;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Added for the Admin Management Module (Vehicle Verification, Module 3).
    // Lets a driver see their own vehicle's review status/rejection reason.
    private VehicleVerificationStatus verificationStatus;
    private String rejectionReason;
}