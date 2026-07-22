package com.ecolift.service.impl;

import com.ecolift.entity.User;
import com.ecolift.entity.Vehicle;
import com.ecolift.exception.ResourceNotFoundException;
import com.ecolift.exception.DuplicateResourceException;
import com.ecolift.repository.VehicleRepository;
import com.ecolift.service.UserService;
import com.ecolift.service.VehicleService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class VehicleServiceImpl implements VehicleService {

    private final VehicleRepository vehicleRepository;
    private final UserService userService;

    public VehicleServiceImpl(VehicleRepository vehicleRepository, UserService userService) {
        this.vehicleRepository = vehicleRepository;
        this.userService = userService;
    }

    @Override
    public Vehicle save(Vehicle vehicle) {
        return vehicleRepository.save(vehicle);
    }

    @Override
    public Vehicle update(Long id, Vehicle vehicleDetails) {
        Vehicle vehicle = findById(id);
        
        // Updated to match your actual entity fields
        vehicle.setManufacturer(vehicleDetails.getManufacturer());
        vehicle.setModel(vehicleDetails.getModel());
        vehicle.setVehicleType(vehicleDetails.getVehicleType());
        vehicle.setFuelType(vehicleDetails.getFuelType());
        vehicle.setColor(vehicleDetails.getColor());
        vehicle.setCapacity(vehicleDetails.getCapacity());
        
        return vehicleRepository.save(vehicle);
    }

    @Override
    public void delete(Long id) {
        Vehicle vehicle = findById(id);
        // Assuming you want soft-delete based on your entity having 'isDeleted'
        vehicle.setIsDeleted(true); 
        vehicleRepository.save(vehicle);
    }

    @Override
    @Transactional(readOnly = true)
    public Vehicle findById(Long id) {
        return vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with id: " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<Vehicle> findAll() {
        return vehicleRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public boolean exists(Long id) {
        return vehicleRepository.existsById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public long count() {
        return vehicleRepository.count();
    }

    @Override
    public Vehicle registerVehicle(Long driverId, Vehicle vehicle) {
        if (vehicleRepository.findByLicensePlate(vehicle.getLicensePlate()).isPresent()) {
            throw new DuplicateResourceException("License plate already registered.");
        }
        User driver = userService.getDriverProfile(driverId);
        vehicle.setDriver(driver);
        vehicle.setIsVerified(false); // Correctly using Lombok's generated setter
        vehicle.setIsDeleted(false);
        return vehicleRepository.save(vehicle);
    }

    @Override
    public Vehicle verifyVehicle(Long vehicleId) {
        Vehicle vehicle = findById(vehicleId);
        vehicle.setIsVerified(true); // Correctly using Lombok's generated setter
        return vehicleRepository.save(vehicle);
    }

    @Override
    public void removeVehicle(Long vehicleId) {
        delete(vehicleId); // Uses the soft-delete defined above
    }

    @Override
    @Transactional(readOnly = true)
    public List<Vehicle> getVehiclesByDriver(Long driverId) {
        userService.exists(driverId); // Validate driver exists
        return vehicleRepository.findByDriverIdAndIsDeletedFalse(driverId);
    }

    @Override
    public Vehicle updateVehicle(Long vehicleId, Vehicle updatedData) {
        return update(vehicleId, updatedData);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Vehicle> findAvailableVehicles(Long driverId) {
        // Now calling the properly named repository method
        return vehicleRepository.findByDriverIdAndIsVerifiedTrueAndIsDeletedFalse(driverId);
    }
}