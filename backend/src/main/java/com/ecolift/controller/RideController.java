package com.ecolift.controller;

import com.ecolift.dto.request.RidePublishRequest;
import com.ecolift.dto.request.RideUpdateRequest;
import com.ecolift.repository.LocationRepository;
import com.ecolift.dto.response.RideResponse;
import com.ecolift.entity.Ride;
import com.ecolift.entity.Location;
import com.ecolift.entity.User;
import com.ecolift.repository.UserRepository;
import com.ecolift.service.RideService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/rides")
public class RideController {

        private final RideService rideService;
        private final UserRepository userRepository;
        private final LocationRepository locationRepository;

        public RideController(RideService rideService, UserRepository userRepository, LocationRepository locationRepository) {
                this.rideService = rideService;
                this.userRepository = userRepository;
                this.locationRepository = locationRepository;
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

                // Resolve location IDs if client provided city names instead of IDs
                Long departureId = request.getDepartureLocationId();
                Long arrivalId = request.getArrivalLocationId();

                if (departureId == null && request.getDepartureCity() != null) {
                        var loc = locationRepository.findByCity(request.getDepartureCity());
                        if (loc != null) departureId = loc.getId();
                        else {
                                // Auto-create minimal Location when city not found
                                Location newLoc = new Location();
                                newLoc.setAddress(request.getDepartureCity());
                                newLoc.setCity(request.getDepartureCity());
                                newLoc.setState("Unknown");
                                newLoc.setLatitude(java.math.BigDecimal.ZERO);
                                newLoc.setLongitude(java.math.BigDecimal.ZERO);
                                Location saved = locationRepository.save(newLoc);
                                departureId = saved.getId();
                        }
                }

                if (arrivalId == null && request.getArrivalCity() != null) {
                        var loc = locationRepository.findByCity(request.getArrivalCity());
                        if (loc != null) arrivalId = loc.getId();
                        else {
                                Location newLoc = new Location();
                                newLoc.setAddress(request.getArrivalCity());
                                newLoc.setCity(request.getArrivalCity());
                                newLoc.setState("Unknown");
                                newLoc.setLatitude(java.math.BigDecimal.ZERO);
                                newLoc.setLongitude(java.math.BigDecimal.ZERO);
                                Location saved = locationRepository.save(newLoc);
                                arrivalId = saved.getId();
                        }
                }

                // 2. Map request fields to your Ride entity
        // Location resolution/validation and driver/vehicle assignment happen in the service layer.
        Ride ride = new Ride();
        ride.setDepartureTime(request.getDepartureTime());
        ride.setEstimateArrivalTime(request.getEstimateArrivalTime());
        ride.setAvailableSeats(request.getAvailableSeats());
        ride.setPricePerSeat(request.getPricePerSeat());
        ride.setIsDeleted(false);

        // 3. Call service method using driver's ID, vehicle ID, and resolved location IDs
        Ride savedRide = rideService.publishRide(
                driver.getId(),
                request.getVehicleId(),
                departureId,
                arrivalId,
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
    @GetMapping("/my")
    @PreAuthorize("hasRole('DRIVER')")
    public ResponseEntity<List<RideResponse>> getMyRides(Authentication authentication) {
        String driverEmail = authentication.getName();
        User driver = userRepository.findByEmail(driverEmail)
                .orElseThrow(() -> new IllegalArgumentException("Driver not found"));

        List<RideResponse> responses = rideService.getDriverRides(driver.getId())
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(responses);
    }

    /**
     * Search for available rides by source city, destination city, departure date/time, and required seats.
     * Example: GET /api/rides/search?source=Delhi&destination=Noida&date=2026-07-25T09:00&seats=2
     */
    @GetMapping("/search")
    public ResponseEntity<List<RideResponse>> searchRides(
            @RequestParam String source,
            @RequestParam String destination,
            @RequestParam("date")
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            LocalDateTime departureTime,
            @RequestParam Integer seats
    ) {
        List<Ride> rides = rideService.searchRides(source, destination, departureTime, seats);
        
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
                .departureLocationName(ride.getDepartureLocation() != null ? ride.getDepartureLocation().getCity() : "Unknown")
                .arrivalLocationName(ride.getArrivalLocation() != null ? ride.getArrivalLocation().getCity() : "Unknown")
                .departureTime(ride.getDepartureTime())
                .arrivalTime(ride.getEstimateArrivalTime())
                .availableSeats(ride.getAvailableSeats())
                .pricePerSeat(ride.getPricePerSeat())
                .isDeleted(ride.getIsDeleted())
                .build();
    }
}