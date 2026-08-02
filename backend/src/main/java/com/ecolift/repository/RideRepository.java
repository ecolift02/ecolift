package com.ecolift.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.ecolift.entity.Ride;

public interface RideRepository extends JpaRepository<Ride, Long> {
        
    List<Ride> findByDriverId(Long driverId);

    @Query("SELECT b.ride FROM Booking b WHERE b.passenger.id = :passengerId")
    List<Ride> findRidesByPassengerId(@Param("passengerId") Long passengerId);

    List<Ride> findByDepartureTimeGreaterThanEqualAndAvailableSeatsGreaterThanEqualAndIsDeletedFalse(
            LocalDateTime departureTime,
            Integer availableSeats
    );

    @Query("SELECT r FROM Ride r WHERE LOWER(r.route.departureLocationName) = LOWER(:source) " +
            "AND LOWER(r.route.arrivalLocationName) = LOWER(:destination) " +
            "AND r.departureTime >= :departureTime " +
            "AND r.availableSeats >= :requiredSeats " +
            "AND r.isDeleted = false " +
            "ORDER BY r.departureTime ASC")
    List<Ride> searchAvailableRides(
            @Param("source") String source,
            @Param("destination") String destination,
            @Param("departureTime") LocalDateTime departureTime,
            @Param("requiredSeats") int requiredSeats
    );
}