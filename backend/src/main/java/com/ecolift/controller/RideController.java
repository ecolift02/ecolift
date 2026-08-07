package com.ecolift.controller;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ecolift.dto.request.RidePublishRequest;
import com.ecolift.dto.request.RideUpdateRequest;
import com.ecolift.dto.request.SearchRideRequest;
import com.ecolift.dto.response.RideResponse;
import com.ecolift.entity.Ride;
import com.ecolift.entity.Route;
import com.ecolift.entity.User;
import com.ecolift.repository.UserRepository;
import com.ecolift.service.RideService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/rides")
public class RideController {

        private final RideService rideService;
        private final UserRepository userRepository;

        public RideController(RideService rideService, UserRepository userRepository) {
                this.rideService = rideService;
                this.userRepository = userRepository;
        }

    /**
     * Publish a new ride.
     * Only users with the DRIVER role can access this endpoint.
     */
    @PostMapping
    @PreAuthorize("hasRole('DRIVER')")
    public ResponseEntity<RideResponse> publishRide(
            @Valid @RequestBody RidePublishRequest request,
            Authentication authentication
    ) {
        // 1. Get driver's email from JWT authentication
        String driverEmail = authentication.getName();
        User driver = userRepository.findByEmail(driverEmail)
                .orElseThrow(() -> new IllegalArgumentException("Driver not found"));

                // 2. Map request fields to your Ride entity
        // Location resolution/validation and driver/vehicle assignment happen in the service layer.
        Ride ride = new Ride();
        ride.setDepartureTime(request.getDepartureTime());
        ride.setEstimateArrivalTime(request.getEstimateArrivalTime());
        ride.setAvailableSeats(request.getAvailableSeats());
        ride.setPricePerSeat(request.getPricePerSeat());
        ride.setIsDeleted(false);

        Route route = new Route();
        route.setDepartureLocationName(request.getStartAddress());
        route.setStartLatitude(request.getStartLatitude());
        route.setStartLongitude(request.getStartLongitude());
        route.setArrivalLocationName(request.getEndAddress());
        route.setEndLatitude(request.getEndLatitude());
        route.setEndLongitude(request.getEndLongitude());
        route.setDistanceKm(request.getDistanceKm());
        route.setPolyline(request.getPolyline());
        ride.setRoute(route);

        // 3. Call service method using driver's ID, vehicle ID, and resolved location IDs
        Ride savedRide = rideService.publishRide(
                driver.getId(),
                request.getVehicleId(),
                ride
        );
        
        // 4. Convert saved Ride entity to RideResponse DTO and return
        return new ResponseEntity<>(mapToResponse(savedRide), HttpStatus.CREATED);
    }

    /**
     * Update an existing ride owned by the currently logged-in driver.
     * Only departure/arrival time, seats, and price can be changed here.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('DRIVER')")
    public ResponseEntity<RideResponse> updateRide(
            @PathVariable Long id,
            @Valid @RequestBody RideUpdateRequest request,
            Authentication authentication
    ) {
        String driverEmail = authentication.getName();
        User driver = userRepository.findByEmail(driverEmail)
                .orElseThrow(() -> new IllegalArgumentException("Driver not found"));

        Ride updateData = new Ride();
        updateData.setDepartureTime(request.getDepartureTime());
        updateData.setEstimateArrivalTime(request.getEstimateArrivalTime());
        updateData.setAvailableSeats(request.getAvailableSeats());
        updateData.setPricePerSeat(request.getPricePerSeat());

        Ride updatedRide = rideService.updateRide(id, driver.getId(), updateData);
        return ResponseEntity.ok(mapToResponse(updatedRide));
    }

    /**
     * Cancel (soft-delete) a ride owned by the currently logged-in driver.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('DRIVER')")
    public ResponseEntity<Void> deleteRide(
            @PathVariable Long id,
            Authentication authentication
    ) {
        String driverEmail = authentication.getName();
        User driver = userRepository.findByEmail(driverEmail)
                .orElseThrow(() -> new IllegalArgumentException("Driver not found"));

        rideService.cancelRide(id, driver.getId());
        return ResponseEntity.noContent().build();
    }

    /**
     * Get all rides published by the currently logged-in driver.
     */
//    @GetMapping("/my")
//    @PreAuthorize("hasRole('DRIVER')")
//    public ResponseEntity<List<RideResponse>> getMyRides(Authentication authentication) {
//        String driverEmail = authentication.getName();
//        User driver = userRepository.findByEmail(driverEmail)
//                .orElseThrow(() -> new IllegalArgumentException("Driver not found"));
//
//        List<RideResponse> responses = rideService.getDriverRides(driver.getId())
//                .stream()
//                .map(this::mapToResponse)
//                .collect(Collectors.toList());
//
//        return ResponseEntity.ok(responses);
//    }
    @GetMapping("/my")
    @PreAuthorize("hasRole('DRIVER')")
    public ResponseEntity<List<RideResponse>> getMyRides(Authentication authentication) {
        String driverEmail = authentication.getName();
        User driver = userRepository.findByEmail(driverEmail)
                .orElseThrow(() -> new IllegalArgumentException("Driver not found"));

        List<RideResponse> responses = rideService.getDriverRides(driver.getId())
                .stream()
                .sorted(Comparator.comparing(Ride::getDepartureTime).reversed())
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(responses);
    }

    /**
     * Search for available rides using passenger route coordinates and polyline.
     * Example: POST /api/rides/search with SearchRideRequest JSON body.
     */
    @PostMapping("/search")
    public ResponseEntity<List<RideResponse>> searchRides(
            @RequestBody SearchRideRequest request
    ) {
        List<Ride> rides = rideService.searchRides(request);

        List<RideResponse> responses = rides.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(responses);
    }

    @GetMapping("/{id}")
    public ResponseEntity<RideResponse> getRideById(@PathVariable Long id) {
        Ride ride = rideService.findById(id);
        return ResponseEntity.ok(mapToResponse(ride));
    }

    /**
     * Helper mapper method to convert a Ride entity into a RideResponse DTO.
     */
    private RideResponse mapToResponse(Ride ride) {
        return RideResponse.builder()
                .rideId(ride.getId())
                .driverName(ride.getDriver() != null ? ride.getDriver().getName() : "Unknown")
                .vehicleModel(ride.getVehicle() != null
                        ? ride.getVehicle().getManufacturer() + " " + ride.getVehicle().getModel()
                        : "Unknown")
                .vehicleLicensePlate(ride.getVehicle() != null ? ride.getVehicle().getLicensePlate() : "Unknown")
                .departureLocationName(ride.getRoute() != null ? ride.getRoute().getDepartureLocationName() : null)
                .arrivalLocationName(ride.getRoute() != null ? ride.getRoute().getArrivalLocationName() : null)
                .startLatitude(ride.getRoute() != null ? ride.getRoute().getStartLatitude() : null)
                .startLongitude(ride.getRoute() != null ? ride.getRoute().getStartLongitude() : null)
                .endLatitude(ride.getRoute() != null ? ride.getRoute().getEndLatitude() : null)
                .endLongitude(ride.getRoute() != null ? ride.getRoute().getEndLongitude() : null)
                .distanceKm(ride.getRoute() != null ? ride.getRoute().getDistanceKm() : null)
                .polyline(ride.getRoute() != null ? ride.getRoute().getPolyline() : null)
                .departureTime(ride.getDepartureTime())
                .arrivalTime(ride.getEstimateArrivalTime())
                .availableSeats(ride.getAvailableSeats())
                .pricePerSeat(ride.getPricePerSeat())
                .isDeleted(ride.getIsDeleted())
                .build();
    }
}