package com.ecolift.controller;

import com.ecolift.dto.request.VehicleRegistrationRequest;
import com.ecolift.dto.response.VehicleResponse;
import com.ecolift.entity.User;
import com.ecolift.entity.Vehicle;
import com.ecolift.repository.UserRepository;
import com.ecolift.service.VehicleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/vehicles")
@RequiredArgsConstructor
public class VehicleController {

    private final VehicleService vehicleService;
    private final UserRepository userRepository; // Added to resolve email to user ID

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<VehicleResponse> registerVehicle(
            @Valid @RequestBody VehicleRegistrationRequest request,
            Authentication authentication
    ) {
        // 1. Get user email from JWT authentication context
        String userEmail = authentication.getName();
        
        // 2. Fetch the user to get their ID
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found."));

        // 3. Map VehicleRegistrationRequest DTO to Vehicle entity
        Vehicle vehicle = new Vehicle();
        vehicle.setManufacturer(request.getManufacturer());
        vehicle.setModel(request.getModel());
        vehicle.setLicensePlate(request.getLicensePlate());
        vehicle.setCapacity(request.getCapacity());

        // 4. Call service method (passing driverId and vehicle entity)
        Vehicle savedVehicle = vehicleService.registerVehicle(user.getId(), vehicle);

        // 5. Check if driver role was granted during this registration
        boolean isDriverGranted = user.getRoles().stream().anyMatch(role -> role.getName().equals("DRIVER"));

        // 6. Map to VehicleResponse DTO
        VehicleResponse response = VehicleResponse.builder()
                .id(savedVehicle.getId())
                .manufacturer(savedVehicle.getManufacturer())
                .model(savedVehicle.getModel())
                .licensePlate(savedVehicle.getLicensePlate())
                .capacity(savedVehicle.getCapacity())
                .isDriverRoleGranted(isDriverGranted)
                .build();

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }
}