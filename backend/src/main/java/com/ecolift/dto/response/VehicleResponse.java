package com.ecolift.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class VehicleResponse {
    private Long id;
    private String manufacturer; // Updated from make to manufacturer
    private String model;
    private String licensePlate;
    private Integer capacity;
    private boolean isDriverRoleGranted;
}