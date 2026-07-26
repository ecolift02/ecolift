package com.ecolift.repository;

import com.ecolift.entity.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface VehicleRepository extends JpaRepository<Vehicle, Long> {

    Optional<Vehicle> findByLicensePlate(String licensePlate);

    Optional<Vehicle> findByRegistrationNumber(String registrationNumber);

    Optional<Vehicle> findByIdAndDriverIdAndIsDeletedFalse(Long id, Long driverId);

    List<Vehicle> findByDriverIdAndIsDeletedFalse(Long driverId);

    List<Vehicle> findByDriverIdAndStatusAndIsDeletedFalse(Long driverId, String status);

    List<Vehicle> findByDriverIdAndIsVerifiedTrueAndIsDeletedFalse(Long driverId);

    boolean existsByLicensePlate(String licensePlate);

    boolean existsByRegistrationNumber(String registrationNumber);
}