package com.ecolift.mapper;

import com.ecolift.dto.request.VehicleRequest;
import com.ecolift.dto.response.VehicleResponse;
import com.ecolift.dto.response.VehicleSummaryResponse;
import com.ecolift.entity.Vehicle;

public class VehicleMapper {

    public static VehicleResponse toResponse(Vehicle vehicle) {
        return VehicleResponse.builder()
                .id(vehicle.getId())
                .vehicleName(vehicle.getVehicleName())
                .vehicleNumber(vehicle.getLicensePlate())
                .vehicleType(vehicle.getVehicleType())
                .brand(vehicle.getManufacturer())
                .model(vehicle.getModel())
                .color(vehicle.getColor())
                .seatCapacity(vehicle.getCapacity())
                .fuelType(vehicle.getFuelType())
                .manufacturingYear(vehicle.getManufacturingYear())
                .registrationNumber(vehicle.getRegistrationNumber())
                .status(vehicle.getStatus())
                .isVerified(vehicle.getIsVerified())
                .createdAt(vehicle.getCreatedAt())
                .updatedAt(vehicle.getUpdatedAt())
                .verificationStatus(vehicle.getVerificationStatus())
                .rejectionReason(vehicle.getRejectionReason())
                .build();
    }

    public static VehicleSummaryResponse toSummary(Vehicle vehicle) {
        return VehicleSummaryResponse.builder()
                .id(vehicle.getId())
                .vehicleName(vehicle.getVehicleName())
                .vehicleNumber(vehicle.getLicensePlate())
                .vehicleType(vehicle.getVehicleType())
                .brand(vehicle.getManufacturer())
                .model(vehicle.getModel())
                .seatCapacity(vehicle.getCapacity())
                .fuelType(vehicle.getFuelType())
                .status(vehicle.getStatus())
                .isVerified(vehicle.getIsVerified())
                .verificationStatus(vehicle.getVerificationStatus())
                .rejectionReason(vehicle.getRejectionReason())
                .build();
    }

    public static Vehicle toEntity(VehicleRequest request) {
        Vehicle vehicle = new Vehicle();
        vehicle.setVehicleName(request.getVehicleName());
        vehicle.setLicensePlate(request.getVehicleNumber());
        vehicle.setVehicleType(request.getVehicleType());
        vehicle.setManufacturer(request.getBrand());
        vehicle.setModel(request.getModel());
        vehicle.setColor(request.getColor());
        vehicle.setCapacity(request.getSeatCapacity());
        vehicle.setFuelType(request.getFuelType());
        vehicle.setManufacturingYear(request.getManufacturingYear());
        vehicle.setRegistrationNumber(request.getRegistrationNumber());
        vehicle.setStatus(request.getStatus());
        return vehicle;
    }

    public static void updateEntity(Vehicle vehicle, VehicleRequest request) {
        vehicle.setVehicleName(request.getVehicleName());
        vehicle.setLicensePlate(request.getVehicleNumber());
        vehicle.setVehicleType(request.getVehicleType());
        vehicle.setManufacturer(request.getBrand());
        vehicle.setModel(request.getModel());
        vehicle.setColor(request.getColor());
        vehicle.setCapacity(request.getSeatCapacity());
        vehicle.setFuelType(request.getFuelType());
        vehicle.setManufacturingYear(request.getManufacturingYear());
        vehicle.setRegistrationNumber(request.getRegistrationNumber());
        vehicle.setStatus(request.getStatus());
    }
}
