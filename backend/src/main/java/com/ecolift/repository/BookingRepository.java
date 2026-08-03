package com.ecolift.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ecolift.entity.Booking;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    boolean existsByRideIdAndPassengerId(Long rideId, Long passengerId);
    List<Booking> findByPassengerId(Long passengerId);
    List<Booking> findByRideId(Long rideId);

    // Added for Booking Management module:
    // Only PENDING/CONFIRMED count as an "active" duplicate - a passenger
    // whose earlier booking was cancelled or rejected should be able to book
    // the same ride again. existsByRideIdAndPassengerId above is left as-is
    // (unused by the new flow, kept for backward compatibility).
    boolean existsByRideIdAndPassengerIdAndStatusIn(Long rideId, Long passengerId, List<Booking.BookingStatus> statuses);

    // Driver-side views: "all bookings across every ride I drive" and
    // "just the ones awaiting my decision".
    List<Booking> findByRideDriverId(Long driverId);
    List<Booking> findByRideDriverIdAndStatus(Long driverId, Booking.BookingStatus status);

    // Added for the Admin Management Module (Booking Monitoring, Module 5).
    List<Booking> findByStatus(Booking.BookingStatus status);
}