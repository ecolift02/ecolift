package com.ecolift.service;

import com.ecolift.entity.Ride;

import java.time.LocalDateTime;
import java.util.List;

public interface RideService {
    Ride save(Ride ride);
    Ride update(Long id, Ride ride);
    void delete(Long id);
    Ride findById(Long id);
    List<Ride> findAll();
    boolean exists(Long id);
    long count();

    Ride publishRide(Long driverId, Long vehicleId, Long departureLocationId, Long arrivalLocationId, Ride ride);
    Ride updateRide(Long rideId, Ride ride);
    void cancelRide(Long rideId);
    void completeRide(Long rideId);
    List<Ride> searchRides(String source, String destination, LocalDateTime departureTime, Integer seats);
    List<Ride> getDriverRides(Long driverId);
    List<Ride> getPassengerBookings(Long passengerId);
    void updateAvailableSeats(Long rideId, int seatsToDeduct);
}