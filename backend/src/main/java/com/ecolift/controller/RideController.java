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
        Ride ride = new Ride();
        ride.setDepartureTime(request.getDepartureTime());
        ride.setEstimateArrivalTime(request.getEstimateArrivalTime());
        ride.setAvailableSeats(request.getAvailableSeats());
        ride.setPricePerSeat(request.getPricePerSeat());
        ride.setIsDeleted(false);

        // 3. Call service method using driver's ID and vehicle ID
        Ride savedRide = rideService.publishRide(driver.getId(), request.getVehicleId(), ride);
        
        // 4. Convert saved Ride entity to RideResponse DTO and return
        return new ResponseEntity<>(mapToResponse(savedRide), HttpStatus.CREATED);
    }

    /**
     * Search for available rides by Location IDs.
     */
    @GetMapping("/search")
    public ResponseEntity<List<RideResponse>> searchRides(
            @RequestParam Long sourceLocationId,
            @RequestParam Long destinationLocationId
    ) {
        List<Ride> rides = rideService.searchRides(sourceLocationId, destinationLocationId);
        
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
                .vehicleModel("Vehicle #" + (ride.getVehicle() != null ? ride.getVehicle().getId() : ""))
                .vehicleLicensePlate(ride.getVehicle() != null ? ride.getVehicle().getLicensePlate() : "Unknown")
                .departureLocationName("Location #" + (ride.getDepartureLocation() != null ? ride.getDepartureLocation().getId() : ""))
                .arrivalLocationName("Location #" + (ride.getArrivalLocation() != null ? ride.getArrivalLocation().getId() : ""))
                .departureTime(ride.getDepartureTime())
                .estimateArrivalTime(ride.getEstimateArrivalTime())
                .availableSeats(ride.getAvailableSeats())
                .pricePerSeat(ride.getPricePerSeat())
                .isDeleted(ride.getIsDeleted())
                .build();
    }
}