package com.ecolift.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import jakarta.persistence.CascadeType;
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
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name="bookings")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Booking {
	@Id
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	private Long id;
	@Column(nullable=false,unique=true,length=50)
	private String bookingReference;
	@ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ride_id", nullable = false)
	private Ride ride;
	@ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "passenger_id", nullable = false)
	private User passenger;
	@Column(nullable = false)
	private Integer seatsBooked;
	@Column(nullable = false, precision = 10, scale = 2)
	private BigDecimal totalPrice;
	
	@Enumerated(EnumType.STRING)
	private BookingStatus status=BookingStatus.PENDING;
	@Column(columnDefinition = "TEXT")
	private String cancellationReason;
	private LocalDateTime cancellationTime;
	@OneToMany(mappedBy = "booking", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
	private List<Payment> payments;
	public enum BookingStatus{PENDING,CONFIRMED,CANCELLED,REJECTED}
	
}
