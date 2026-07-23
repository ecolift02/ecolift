package com.ecolift.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class VehicleRegistrationRequest {
    @NotBlank(message = "Manufacturer is required")
    private String manufacturer; // Updated from make to manufacturer to match the entity

    @NotBlank(message = "Model is required")
    private String model;

    @NotBlank(message = "License plate is required")
    private String licensePlate;

    @NotNull(message = "Capacity is required")
    @Min(value = 1, message = "Vehicle must hold at least 1 passenger")
    private Integer capacity;
}