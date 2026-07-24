package com.ecolift.controller;

import com.ecolift.dto.request.RidePublishRequest;
import com.ecolift.dto.response.RideResponse;
import com.ecolift.entity.Ride;
import com.ecolift.entity.User;
import com.ecolift.repository.UserRepository;
import com.ecolift.service.RideService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
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
@RequiredArgsConstructor
public class RideController {

    private final RideService rideService;
    private final UserRepository userRepository;

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

        // 3. Call service method using driver's ID, vehicle ID, and location IDs
        Ride savedRide = rideService.publishRide(
                driver.getId(),
                request.getVehicleId(),
                request.getDepartureLocationId(),
                request.getArrivalLocationId(),
                ride
        );
        
        // 4. Convert saved Ride entity to RideResponse DTO and return
        return new ResponseEntity<>(mapToResponse(savedRide), HttpStatus.CREATED);
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
                .estimateArrivalTime(ride.getEstimateArrivalTime())
                .availableSeats(ride.getAvailableSeats())
                .pricePerSeat(ride.getPricePerSeat())
                .isDeleted(ride.getIsDeleted())
                .build();
    }
}