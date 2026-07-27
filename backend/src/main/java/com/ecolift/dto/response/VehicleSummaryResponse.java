package com.ecolift.dto.response;

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
}
