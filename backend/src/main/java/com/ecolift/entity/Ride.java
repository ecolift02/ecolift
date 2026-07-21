package com.ecolift.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

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
@Table(name="rides")
@Data
@NoArgsConstructor
@AllArgsConstructor

public class Ride {
	@Id
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private Long id;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name="driver_id",nullable=false)
	private User driver;
	
	@ManyToOne(fetch=FetchType.LAZY)
	@JoinColumn(name="vehicle_id",nullable=false)
	private Vehicle vehicle;
	
	@ManyToOne(fetch=FetchType.EAGER)
	@JoinColumn(name="departure_location_id",nullable=false)
	private Location departureLocation;
	
	@ManyToOne(fetch=FetchType.EAGER)
	@JoinColumn(name="arrival_location_id",nullable=false)
	private Location arrivalLocation;
	
	@Column(nullable=false)
	private LocalDateTime departureTime;
	
	private LocalDateTime estimateArrivalTime;
	
	@Column(nullable=false)
	private Integer availableSeats;
	
	@Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal pricePerSeat;
	
	private Boolean isDeleted=false;
	
}
