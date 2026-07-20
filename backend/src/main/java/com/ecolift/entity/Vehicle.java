package com.ecolift.entity;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name="vehicles")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Vehicle {
	@Id
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private Long id;
	@ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "driver_id", nullable = false)
	private User driver;
	
	@Column(nullable = false, length = 50)
    private String manufacturer;
	@Column(nullable = false, length = 100)
    private String model;

    private String vehicleType;
    private String fuelType;
    @Column(nullable = false, unique = true, length = 20)
    private String licensePlate;
    private String color;
    @Column(nullable = false)
    private Integer capacity;
    @Column(unique = true)
    private String registrationNumber;
    private LocalDate registrationExpiry;
    private LocalDate insuranceExpiry;
    private String vehicleImageUrl;
    private Boolean isVerified = false;
    private Boolean isDeleted = false;
}
