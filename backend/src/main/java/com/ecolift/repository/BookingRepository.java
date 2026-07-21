package com.ecolift.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ecolift.entity.Booking;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    boolean existsByRideIdAndPassengerId(Long rideId, Long passengerId);
    List<Booking> findByPassengerId(Long passengerId);
    List<Booking> findByRideId(Long rideId);
}
