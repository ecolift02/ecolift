package com.ecolift.service.impl;

import com.ecolift.entity.Role;
import com.ecolift.entity.User;
import com.ecolift.entity.Vehicle;
import com.ecolift.exception.DuplicateResourceException;
import com.ecolift.exception.ResourceNotFoundException;
import com.ecolift.repository.RoleRepository;
import com.ecolift.repository.UserRepository;
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
    private final UserRepository userRepository; // Added to save role updates on the user
    private final RoleRepository roleRepository; // Added to fetch the DRIVER role

    public VehicleServiceImpl(
            VehicleRepository vehicleRepository, 
            UserService userService, 
            UserRepository userRepository, 
            RoleRepository roleRepository
    ) {
        this.vehicleRepository = vehicleRepository;
        this.userService = userService;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
    }

    @Override
    public Vehicle save(Vehicle vehicle) {
        return vehicleRepository.save(vehicle);
    }

    @Override
    public Vehicle update(Long id, Vehicle vehicleDetails) {
        Vehicle vehicle = findById(id);
        
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

        // Fetch user directly using findById instead of getDriverProfile to avoid pre-check blocks
        User driver = userService.findById(driverId);
        
        vehicle.setDriver(driver);
        vehicle.setIsVerified(false);
        vehicle.setIsDeleted(false);
        
        Vehicle savedVehicle = vehicleRepository.save(vehicle);

        // Role Escalation: Ensure user has the DRIVER role granted upon vehicle registration
        boolean isAlreadyDriver = driver.getRoles().stream()
                .anyMatch(role -> role.getName().equalsIgnoreCase("DRIVER"));

        if (!isAlreadyDriver) {
            Role driverRole = roleRepository.findByName("DRIVER")
                    .orElseThrow(() -> new IllegalStateException("DRIVER role not found in system."));
            
            driver.getRoles().add(driverRole);
            userRepository.save(driver);
        }

        return savedVehicle;
    }
    @Override
    public Vehicle verifyVehicle(Long vehicleId) {
        Vehicle vehicle = findById(vehicleId);
        vehicle.setIsVerified(true);
        return vehicleRepository.save(vehicle);
    }

    @Override
    public void removeVehicle(Long vehicleId) {
        delete(vehicleId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Vehicle> getVehiclesByDriver(Long driverId) {
        userService.exists(driverId);
        return vehicleRepository.findByDriverIdAndIsDeletedFalse(driverId);
    }

    @Override
    public Vehicle updateVehicle(Long vehicleId, Vehicle updatedData) {
        return update(vehicleId, updatedData);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Vehicle> findAvailableVehicles(Long driverId) {
        return vehicleRepository.findByDriverIdAndIsVerifiedTrueAndIsDeletedFalse(driverId);
    }
}