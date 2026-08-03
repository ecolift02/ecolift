package com.ecolift.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "vehicles")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Vehicle {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "driver_id", nullable = false)
    private User driver;

    @Column(name = "vehicle_name", nullable = false, length = 100)
    private String vehicleName;

    @Column(name = "vehicle_type", nullable = false, length = 20)
    private String vehicleType;

    @Column(name = "manufacturer", nullable = false, length = 50)
    private String manufacturer;

    @Column(name = "model", nullable = false, length = 100)
    private String model;

    @Column(name = "license_plate", nullable = false, unique = true, length = 20)
    private String licensePlate;

    @Column(name = "color", nullable = false, length = 30)
    private String color;

    @Column(name = "capacity", nullable = false)
    private Integer capacity;

    @Column(name = "fuel_type", nullable = false, length = 20)
    private String fuelType;

    @Column(name = "manufacturing_year", nullable = false)
    private Integer manufacturingYear;

    @Column(name = "registration_number", nullable = false, unique = true, length = 30)
    private String registrationNumber;

    @Column(name = "status", nullable = false, length = 20)
    private String status;

    @Column(name = "registration_expiry")
    private LocalDate registrationExpiry;

    @Column(name = "insurance_expiry")
    private LocalDate insuranceExpiry;

    @Column(name = "vehicle_image_url")
    private String vehicleImageUrl;

    @Column(name = "is_verified")
    private Boolean isVerified = false;

    // Added for the Admin Management Module (Vehicle Verification, Module 3).
    // isVerified above is kept as-is (RideServiceImpl already gates ride
    // publishing on it) and is now kept in sync with this new field:
    // APPROVED -> isVerified = true, PENDING/REJECTED -> isVerified = false.
    @Enumerated(EnumType.STRING)
    @Column(name = "verification_status", length = 20)
    private VehicleVerificationStatus verificationStatus = VehicleVerificationStatus.PENDING;

    // Only populated when verificationStatus = REJECTED.
    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    @Column(name = "is_deleted")
    private Boolean isDeleted = false;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        LocalDateTime now = LocalDateTime.now();
        if (createdAt == null) {
            createdAt = now;
        }
        updatedAt = now;
        if (status == null) {
            status = "ACTIVE";
        }
        if (verificationStatus == null) {
            verificationStatus = VehicleVerificationStatus.PENDING;
        }
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
