package com.ecolift.service;

import com.ecolift.entity.Vehicle;
import java.util.List;

public interface VehicleService {
    Vehicle save(Vehicle vehicle);
    Vehicle update(Long id, Vehicle vehicle);
    void delete(Long id);
    Vehicle findById(Long id);
    List<Vehicle> findAll();
    boolean exists(Long id);
    long count();

    Vehicle registerVehicle(Long driverId, Vehicle vehicle);
    Vehicle verifyVehicle(Long vehicleId);
    void removeVehicle(Long vehicleId);
    List<Vehicle> getVehiclesByDriver(Long driverId);
    Vehicle updateVehicle(Long vehicleId, Vehicle updatedData);
    List<Vehicle> findAvailableVehicles(Long driverId);
}