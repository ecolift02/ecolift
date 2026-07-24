package com.ecolift.service.impl;

import com.ecolift.entity.Location;
import com.ecolift.entity.Ride;
import com.ecolift.entity.User;
import com.ecolift.entity.Vehicle;
import com.ecolift.exception.InvalidRideStateException;
import com.ecolift.exception.ResourceNotFoundException;
import com.ecolift.exception.SeatUnavailableException;
import com.ecolift.exception.VehicleNotVerifiedException;
import com.ecolift.repository.LocationRepository;
import com.ecolift.repository.RideRepository;
import com.ecolift.service.RideService;
import com.ecolift.service.UserService;
import com.ecolift.service.VehicleService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class RideServiceImpl implements RideService {

    private final RideRepository rideRepository;
    private final UserService userService;
    private final VehicleService vehicleService;
    private final LocationRepository locationRepository;

    public RideServiceImpl(RideRepository rideRepository, UserService userService, VehicleService vehicleService,
            LocationRepository locationRepository) {
        this.rideRepository = rideRepository;
        this.userService = userService;
        this.vehicleService = vehicleService;
        this.locationRepository = locationRepository;
    }

    @Override
    public Ride save(Ride ride) {
        return rideRepository.save(ride);
    }

    @Override
    public Ride update(Long id, Ride rideDetails) {
        Ride ride = findById(id);
        
        // Updated to use actual entity fields (DepartureTime instead of StartTime, PricePerSeat instead of Fare)
        ride.setDepartureTime(rideDetails.getDepartureTime());
        ride.setEstimateArrivalTime(rideDetails.getEstimateArrivalTime());
        ride.setPricePerSeat(rideDetails.getPricePerSeat());
        
        return rideRepository.save(ride);
    }

    @Override
    public void delete(Long id) {
        Ride ride = findById(id);
        ride.setIsDeleted(true); // Soft delete based on entity
        rideRepository.save(ride);
    }

    @Override
    @Transactional(readOnly = true)
    public Ride findById(Long id) {
        return rideRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ride not found with id: " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<Ride> findAll() {
        return rideRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public boolean exists(Long id) {
        return rideRepository.existsById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public long count() {
        return rideRepository.count();
    }

    @Override
    public Ride publishRide(Long driverId, Long vehicleId, Long departureLocationId, Long arrivalLocationId, Ride ride) {
        User driver = userService.getDriverProfile(driverId);
        Vehicle vehicle = vehicleService.findById(vehicleId);

        if (!vehicle.getDriver().getId().equals(driverId)) {
            throw new InvalidRideStateException("Vehicle does not belong to the driver.");
        }
        
        // ERROR 1 FIXED: Used Lombok's generated getIsVerified() safely.
        if (!Boolean.TRUE.equals(vehicle.getIsVerified())) {
            throw new VehicleNotVerifiedException("Cannot publish a ride with an unverified vehicle.");
        }

        Location departure = locationRepository.findById(departureLocationId)
                .orElseThrow(() -> new ResourceNotFoundException("Departure location not found with id: " + departureLocationId));

        Location arrival = locationRepository.findById(arrivalLocationId)
                .orElseThrow(() -> new ResourceNotFoundException("Arrival location not found with id: " + arrivalLocationId));

        if (departure.getId().equals(arrival.getId())) {
            throw new IllegalArgumentException("Departure and arrival cannot be same.");
        }

        if (ride.getAvailableSeats() != null && vehicle.getCapacity() != null
                && ride.getAvailableSeats() > vehicle.getCapacity()) {
            throw new IllegalArgumentException("Available seats cannot exceed vehicle capacity.");
        }

        if (ride.getDepartureTime() != null && ride.getDepartureTime().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Departure time cannot be in the past.");
        }

        if (ride.getPricePerSeat() != null && ride.getPricePerSeat().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Price per seat must be greater than zero.");
        }

        ride.setDriver(driver);
        ride.setVehicle(vehicle);
        ride.setDepartureLocation(departure);
        ride.setArrivalLocation(arrival);
        
        // ERROR 3 FIXED: Removed setStatus(). Mapped to isDeleted flag instead.
        ride.setIsDeleted(false);
        
        return rideRepository.save(ride);
    }

    @Override
    public Ride updateRide(Long rideId, Ride updatedData) {
        return update(rideId, updatedData);
    }

    @Override
    public void cancelRide(Long rideId) {
        Ride ride = findById(rideId);
        
        // ERROR 3 FIXED: Removed string status check. Using isDeleted.
        if (Boolean.TRUE.equals(ride.getIsDeleted())) {
            throw new InvalidRideStateException("Ride is already cancelled.");
        }
        ride.setIsDeleted(true); // Soft-delete acts as cancellation
        rideRepository.save(ride);
    }

    @Override
    public void completeRide(Long rideId) {
        Ride ride = findById(rideId);
        // Since Ride entity does not have a status or completion flag, 
        // we just ensure the ride exists and save any state changes if needed later.
        rideRepository.save(ride);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Ride> searchRides(String source, String destination, LocalDateTime departureTime, Integer seats) {
        return rideRepository.searchAvailableRides(source, destination, departureTime, seats);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Ride> getDriverRides(Long driverId) {
        return rideRepository.findByDriverId(driverId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Ride> getPassengerBookings(Long passengerId) {
        return rideRepository.findRidesByPassengerId(passengerId);
    }

    @Override
    public void updateAvailableSeats(Long rideId, int seatsToDeduct) {
        Ride ride = findById(rideId);
        if (ride.getAvailableSeats() < seatsToDeduct) {
            throw new SeatUnavailableException("Not enough seats available.");
        }
        ride.setAvailableSeats(ride.getAvailableSeats() - seatsToDeduct);
        rideRepository.save(ride);
    }
}