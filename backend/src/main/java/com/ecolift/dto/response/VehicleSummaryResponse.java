package com.ecolift.dto.response;

import com.ecolift.entity.VehicleVerificationStatus;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class VehicleSummaryResponse {
    private Long id;
    private String vehicleName;
    private String vehicleNumber;
    private String vehicleType;
    private String brand;
    private String model;
    private Integer seatCapacity;
    private String fuelType;
    private String status;
    private Boolean isVerified;

    // Added for the Admin Management Module (Vehicle Verification, Module 3).
    private VehicleVerificationStatus verificationStatus;
    private String rejectionReason;
}
