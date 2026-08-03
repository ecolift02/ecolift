package com.ecolift.service.impl;

import com.ecolift.entity.Role;
import com.ecolift.entity.User;
import com.ecolift.entity.Vehicle;
import com.ecolift.entity.VehicleVerificationStatus;
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
    public Vehicle createVehicle(Long driverId, Vehicle vehicle) {
        if (vehicleRepository.existsByLicensePlate(vehicle.getLicensePlate())) {
            throw new DuplicateResourceException("Vehicle number already exists.");
        }
        if (vehicleRepository.existsByRegistrationNumber(vehicle.getRegistrationNumber())) {
            throw new DuplicateResourceException("Registration number already exists.");
        }

        User driver = userService.findById(driverId);
        vehicle.setDriver(driver);
        vehicle.setIsDeleted(false);
        // Auto-verify (see note in registerVehicle) since no verification flow exists yet.
        vehicle.setIsVerified(true);

        return vehicleRepository.save(vehicle);
    }

    @Override
    public List<Vehicle> getMyVehicles(Long driverId) {
        userService.exists(driverId);
        return vehicleRepository.findByDriverIdAndIsDeletedFalse(driverId);
    }

    @Override
    public Vehicle getMyVehicleById(Long driverId, Long vehicleId) {
        return vehicleRepository.findByIdAndDriverIdAndIsDeletedFalse(vehicleId, driverId)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found for this driver."));
    }

    @Override
    public Vehicle updateVehicleForDriver(Long driverId, Long vehicleId, Vehicle updatedVehicle) {
        Vehicle vehicle = getMyVehicleById(driverId, vehicleId);

        if (!vehicle.getLicensePlate().equals(updatedVehicle.getLicensePlate()) &&
                vehicleRepository.existsByLicensePlate(updatedVehicle.getLicensePlate())) {
            throw new DuplicateResourceException("Vehicle number already exists.");
        }

        if (!vehicle.getRegistrationNumber().equals(updatedVehicle.getRegistrationNumber()) &&
                vehicleRepository.existsByRegistrationNumber(updatedVehicle.getRegistrationNumber())) {
            throw new DuplicateResourceException("Registration number already exists.");
        }

        vehicle.setVehicleName(updatedVehicle.getVehicleName());
        vehicle.setVehicleType(updatedVehicle.getVehicleType());
        vehicle.setManufacturer(updatedVehicle.getManufacturer());
        vehicle.setModel(updatedVehicle.getModel());
        vehicle.setColor(updatedVehicle.getColor());
        vehicle.setCapacity(updatedVehicle.getCapacity());
        vehicle.setFuelType(updatedVehicle.getFuelType());
        vehicle.setManufacturingYear(updatedVehicle.getManufacturingYear());
        vehicle.setLicensePlate(updatedVehicle.getLicensePlate());
        vehicle.setRegistrationNumber(updatedVehicle.getRegistrationNumber());
        vehicle.setStatus(updatedVehicle.getStatus());

        // Added for the Admin Management Module (Vehicle Verification, Module 3):
        // editing a rejected vehicle is treated as a resubmission for review.
        if (vehicle.getVerificationStatus() == VehicleVerificationStatus.REJECTED) {
            vehicle.setVerificationStatus(VehicleVerificationStatus.PENDING);
            vehicle.setRejectionReason(null);
            vehicle.setIsVerified(false);
        }

        return vehicleRepository.save(vehicle);
    }

    @Override
    public void deleteVehicleForDriver(Long driverId, Long vehicleId) {
        Vehicle vehicle = getMyVehicleById(driverId, vehicleId);
        vehicle.setIsDeleted(true);
        vehicleRepository.save(vehicle);
    }

    @Override
    public List<Vehicle> getActiveVehiclesForDriver(Long driverId) {
        return vehicleRepository.findByDriverIdAndStatusAndIsDeletedFalse(driverId, "ACTIVE");
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
        // UPDATED for the Admin Management Module (Vehicle Verification, Module 3):
        // a real admin verification workflow now exists (see approveVehicle/
        // rejectVehicle below), so new vehicles start PENDING/unverified instead
        // of being auto-verified. Only an admin-approved vehicle can be used to
        // publish a ride (enforced in RideServiceImpl via isVerified, unchanged).
        vehicle.setVerificationStatus(VehicleVerificationStatus.PENDING);
        vehicle.setRejectionReason(null);
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
        // Kept in sync so this pre-existing method still leaves the vehicle in a
        // consistent state now that verificationStatus exists.
        vehicle.setVerificationStatus(VehicleVerificationStatus.APPROVED);
        vehicle.setRejectionReason(null);
        return vehicleRepository.save(vehicle);
    }

    // ---- Added for the Admin Management Module (Vehicle Verification, Module 3) ----

    @Override
    @Transactional(readOnly = true)
    public List<Vehicle> getVehiclesByVerificationStatus(VehicleVerificationStatus status) {
        return vehicleRepository.findByVerificationStatusAndIsDeletedFalse(status);
    }

    @Override
    public Vehicle approveVehicle(Long vehicleId) {
        Vehicle vehicle = findById(vehicleId);
        vehicle.setVerificationStatus(VehicleVerificationStatus.APPROVED);
        vehicle.setIsVerified(true);
        vehicle.setRejectionReason(null);
        return vehicleRepository.save(vehicle);
    }

    @Override
    public Vehicle rejectVehicle(Long vehicleId, String reason) {
        Vehicle vehicle = findById(vehicleId);
        vehicle.setVerificationStatus(VehicleVerificationStatus.REJECTED);
        vehicle.setIsVerified(false);
        vehicle.setRejectionReason(reason);
        return vehicleRepository.save(vehicle);
    }

    @Override
    @Transactional(readOnly = true)
    public long countByVerificationStatus(VehicleVerificationStatus status) {
        return vehicleRepository.countByVerificationStatus(status);
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