package com.ecolift.repository;

import com.ecolift.entity.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface VehicleRepository extends JpaRepository<Vehicle, Long> {
    
    Optional<Vehicle> findByLicensePlate(String licensePlate);
    
    // Updated to factor in the isDeleted flag so deleted vehicles don't show up
    List<Vehicle> findByDriverIdAndIsDeletedFalse(Long driverId);
    
    // Updated to match the 'isVerified' and 'isDeleted' field names exactly
    List<Vehicle> findByDriverIdAndIsVerifiedTrueAndIsDeletedFalse(Long driverId);
    
    boolean existsByLicensePlate(String licensePlate);
}