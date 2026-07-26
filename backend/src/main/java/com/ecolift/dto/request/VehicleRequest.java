package com.ecolift.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class VehicleRequest {

    @NotBlank(message = "Vehicle name is required")
    private String vehicleName;

    @NotBlank(message = "Vehicle number is required")
    private String vehicleNumber;

    @NotBlank(message = "Vehicle type is required")
    @Pattern(regexp = "Car|SUV|Hatchback|Sedan|Bike|Van", message = "Vehicle type must be one of Car, SUV, Hatchback, Sedan, Bike, Van")
    private String vehicleType;

    @NotBlank(message = "Brand is required")
    private String brand;

    @NotBlank(message = "Model is required")
    private String model;

    @NotBlank(message = "Color is required")
    private String color;

    @NotNull(message = "Seat capacity is required")
    @Min(value = 1, message = "Seat capacity must be at least 1")
    @Max(value = 10, message = "Seat capacity cannot exceed 10")
    private Integer seatCapacity;

    @NotBlank(message = "Fuel type is required")
    @Pattern(regexp = "Petrol|Diesel|Electric|Hybrid|CNG", message = "Fuel type must be one of Petrol, Diesel, Electric, Hybrid, CNG")
    private String fuelType;

    @NotNull(message = "Manufacturing year is required")
    @Min(value = 1900, message = "Manufacturing year must be valid")
    private Integer manufacturingYear;

    @NotBlank(message = "Registration number is required")
    private String registrationNumber;

    @NotBlank(message = "Status is required")
    @Pattern(regexp = "ACTIVE|INACTIVE", message = "Status must be ACTIVE or INACTIVE")
    private String status;
}
