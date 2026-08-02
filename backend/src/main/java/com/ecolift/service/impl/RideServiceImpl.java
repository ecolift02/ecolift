package com.ecolift.service.impl;

import com.ecolift.entity.Ride;
import com.ecolift.entity.Route;
import com.ecolift.entity.User;
import com.ecolift.dto.request.SearchRideRequest;
import com.ecolift.entity.Vehicle;
import com.ecolift.exception.InvalidRideStateException;
import com.ecolift.exception.ResourceNotFoundException;
import com.ecolift.exception.SeatUnavailableException;
import com.ecolift.exception.UnauthorizedActionException;
import com.ecolift.exception.VehicleNotVerifiedException;
import com.ecolift.repository.LocationRepository;
import com.ecolift.repository.RideRepository;
import com.ecolift.service.RideService;
import com.ecolift.service.UserService;
import com.ecolift.service.VehicleService;
import com.mapbox.geojson.Point;
import com.mapbox.geojson.utils.PolylineUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

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
    public Ride publishRide(Long driverId, Long vehicleId, Ride ride) {
        User driver = userService.getDriverProfile(driverId);
        Vehicle vehicle = vehicleService.findById(vehicleId);

        if (!vehicle.getDriver().getId().equals(driverId)) {
            throw new InvalidRideStateException("Vehicle does not belong to the driver.");
        }
        
        // ERROR 1 FIXED: Used Lombok's generated getIsVerified() safely.
        if (!Boolean.TRUE.equals(vehicle.getIsVerified())) {
            throw new VehicleNotVerifiedException("Cannot publish a ride with an unverified vehicle.");
        }

        if (ride.getRoute() == null) {
            throw new IllegalArgumentException("Route details are required.");
        }

        Route route = ride.getRoute();
        if (route.getDepartureLocationName() == null || route.getDepartureLocationName().isBlank()
                || route.getArrivalLocationName() == null || route.getArrivalLocationName().isBlank()
                || route.getStartLatitude() == null || route.getStartLongitude() == null
                || route.getEndLatitude() == null || route.getEndLongitude() == null
                || route.getDistanceKm() == null || route.getDistanceKm() <= 0
                || route.getPolyline() == null || route.getPolyline().isBlank()) {
            throw new IllegalArgumentException("Route details are incomplete.");
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
        ride.setRoute(route);
        
        // ERROR 3 FIXED: Removed setStatus(). Mapped to isDeleted flag instead.
        ride.setIsDeleted(false);
        
        return rideRepository.save(ride);
    }

    @Override
    public Ride updateRide(Long rideId, Long driverId, Ride updatedData) {
        Ride ride = findById(rideId);

        if (!ride.getDriver().getId().equals(driverId)) {
            throw new UnauthorizedActionException("You are not authorized to edit this ride.");
        }

        if (Boolean.TRUE.equals(ride.getIsDeleted())) {
            throw new InvalidRideStateException("Cannot edit a cancelled ride.");
        }

        if (updatedData.getDepartureTime() != null && updatedData.getDepartureTime().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Departure time cannot be in the past.");
        }

        if (updatedData.getEstimateArrivalTime() != null && updatedData.getDepartureTime() != null
                && !updatedData.getEstimateArrivalTime().isAfter(updatedData.getDepartureTime())) {
            throw new IllegalArgumentException("Arrival time must be after departure time.");
        }

        if (updatedData.getPricePerSeat() != null && updatedData.getPricePerSeat().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Price per seat must be greater than zero.");
        }

        if (updatedData.getAvailableSeats() != null) {
            if (updatedData.getAvailableSeats() < 1) {
                throw new IllegalArgumentException("Must offer at least 1 seat.");
            }
            if (ride.getVehicle() != null && ride.getVehicle().getCapacity() != null
                    && updatedData.getAvailableSeats() > ride.getVehicle().getCapacity()) {
                throw new IllegalArgumentException("Available seats cannot exceed vehicle capacity.");
            }
        }

        ride.setDepartureTime(updatedData.getDepartureTime());
        ride.setEstimateArrivalTime(updatedData.getEstimateArrivalTime());
        ride.setPricePerSeat(updatedData.getPricePerSeat());
        ride.setAvailableSeats(updatedData.getAvailableSeats());

        return rideRepository.save(ride);
    }

    @Override
    public void cancelRide(Long rideId, Long driverId) {
        Ride ride = findById(rideId);

        if (!ride.getDriver().getId().equals(driverId)) {
            throw new UnauthorizedActionException("You are not authorized to cancel this ride.");
        }

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
    public List<Ride> searchRides(SearchRideRequest request) {
        List<Ride> candidates = rideRepository
                .findByDepartureTimeGreaterThanEqualAndAvailableSeatsGreaterThanEqualAndIsDeletedFalse(
                        request.getDepartureTime(),
                        request.getSeats());

        List<double[]> passengerRoute = decodePolyline(request.getPolyline());
        if (passengerRoute.isEmpty()) {
            return List.of();
        }

        int tolerance = 200; // 100 meters tolerance for relaxed matching

        return candidates.stream()
                .filter(ride -> ride.getRoute() != null && ride.getRoute().getPolyline() != null)
                .filter(ride -> {
                    List<double[]> driverRoute = decodePolyline(ride.getRoute().getPolyline());
                    if (driverRoute.isEmpty()) {
                        return false;
                    }
                    double percentage = relaxedMatch(driverRoute, passengerRoute, tolerance);
                    return percentage >= 25.0;
                })
                .toList();
    }

    private static List<double[]> decodePolyline(String encoded) {
        List<double[]> route = new ArrayList<>();
        if (encoded == null || encoded.isBlank()) {
            return route;
        }

        try {
            List<Point> points = PolylineUtils.decode(encoded, 5);
            for (Point point : points) {
                route.add(new double[]{point.latitude(), point.longitude()});
            }
        } catch (Exception e) {
            // If decoding fails, return an empty route so the ride is excluded.
            return List.of();
        }

        return route;
    }

    private static double relaxedMatch(
        List<double[]> driverRoute,
        List<double[]> passengerRoute,
        int toleranceMeters) {

        if (driverRoute.isEmpty() || passengerRoute.isEmpty()) {
            return 0.0;
        }

        List<Integer> matchedIndices = new ArrayList<>();

        // Find nearest driver point for every passenger point
        for (double[] passengerPoint : passengerRoute) {

            int nearestIndex = -1;
            double nearestDistance = Double.MAX_VALUE;

            for (int i = 0; i < driverRoute.size(); i++) {

                double[] driverPoint = driverRoute.get(i);

                double distance = haversineDistanceMeters(
                        passengerPoint[0], passengerPoint[1],
                        driverPoint[0], driverPoint[1]);

                if (distance < nearestDistance) {
                    nearestDistance = distance;
                    nearestIndex = i;
                }
            }

            if (nearestDistance <= toleranceMeters) {
                matchedIndices.add(nearestIndex);
            }
        }

        if (matchedIndices.isEmpty()) {
            return 0.0;
        }

        // Longest increasing run
        int bestRun = 1;
        int currentRun = 1;

        final int MAX_INDEX_GAP = 3; // Increase to 5-10 if needed

        for (int i = 1; i < matchedIndices.size(); i++) {

            int diff = matchedIndices.get(i) - matchedIndices.get(i - 1);

            if (diff > 0 && diff <= MAX_INDEX_GAP) {
                currentRun++;
            } else {
                currentRun = 1;
            }

            bestRun = Math.max(bestRun, currentRun);
        }

        return (bestRun * 100.0) / passengerRoute.size();
    }

    private static double haversineDistanceMeters(double lat1, double lon1, double lat2, double lon2) {
        final double R = 6371000.0;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
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