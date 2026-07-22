package com.ecolift.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.ecolift.entity.Ride;

public interface RideRepository extends JpaRepository<Ride, Long> {
    
    List<Ride> findByDepartureLocationIdAndArrivalLocationIdAndIsDeletedFalse(Long departureLocationId, Long arrivalLocationId);
    
    List<Ride> findByDriverId(Long driverId);
    
    // Updated JPQL to select the ride directly from the Booking entity 
    // This avoids needing a bidirectional @OneToMany 'bookings' list inside the Ride entity
    @Query("SELECT b.ride FROM Booking b WHERE b.passenger.id = :passengerId")
    List<Ride> findRidesByPassengerId(@Param("passengerId") Long passengerId);
}