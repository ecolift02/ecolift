package com.ecolift.repository;

import com.ecolift.entity.Vehicle;
import com.ecolift.entity.VehicleVerificationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
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

    // Added for the Admin Management Module (Vehicle Verification, Module 3).
    List<Vehicle> findByVerificationStatusAndIsDeletedFalse(VehicleVerificationStatus verificationStatus);

    long countByVerificationStatus(VehicleVerificationStatus verificationStatus);

    // One-time backfill for vehicles created before this module existed (see
    // AdminDataInitializer). They were auto-verified under the old behavior,
    // so they are backfilled as APPROVED rather than being newly blocked.
    @Modifying
    @Query("UPDATE Vehicle v SET v.verificationStatus = com.ecolift.entity.VehicleVerificationStatus.APPROVED " +
            "WHERE v.verificationStatus IS NULL AND v.isVerified = true")
    int backfillApprovedForVerifiedLegacyVehicles();

    @Modifying
    @Query("UPDATE Vehicle v SET v.verificationStatus = com.ecolift.entity.VehicleVerificationStatus.PENDING " +
            "WHERE v.verificationStatus IS NULL AND (v.isVerified = false OR v.isVerified IS NULL)")
    int backfillPendingForUnverifiedLegacyVehicles();
}