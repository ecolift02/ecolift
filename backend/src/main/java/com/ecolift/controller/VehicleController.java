package com.ecolift.controller;

import com.ecolift.dto.request.VehicleRequest;
import com.ecolift.dto.response.VehicleResponse;
import com.ecolift.dto.response.VehicleSummaryResponse;
import com.ecolift.entity.User;
import com.ecolift.entity.Vehicle;
import com.ecolift.mapper.VehicleMapper;
import com.ecolift.repository.UserRepository;
import com.ecolift.service.VehicleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/vehicles")
@RequiredArgsConstructor
public class VehicleController {

    private final VehicleService vehicleService;
    private final UserRepository userRepository;

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<VehicleResponse> createVehicle(
            @Valid @RequestBody VehicleRequest request,
            Authentication authentication
    ) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new IllegalArgumentException("User not found."));

        Vehicle vehicle = VehicleMapper.toEntity(request);
        Vehicle savedVehicle = vehicleService.registerVehicle(user.getId(), vehicle);

        return new ResponseEntity<>(VehicleMapper.toResponse(savedVehicle), HttpStatus.CREATED);
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('DRIVER')")
    public ResponseEntity<List<VehicleSummaryResponse>> getMyVehicles(
            Authentication authentication
    ) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new IllegalArgumentException("User not found."));

        List<VehicleSummaryResponse> vehicles = vehicleService.getMyVehicles(user.getId())
                .stream()
                .map(VehicleMapper::toSummary)
                .collect(Collectors.toList());

        return ResponseEntity.ok(vehicles);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('DRIVER')")
    public ResponseEntity<VehicleResponse> getVehicleById(
            @PathVariable Long id,
            Authentication authentication
    ) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new IllegalArgumentException("User not found."));

        Vehicle vehicle = vehicleService.getMyVehicleById(user.getId(), id);
        return ResponseEntity.ok(VehicleMapper.toResponse(vehicle));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('DRIVER')")
    public ResponseEntity<VehicleResponse> updateVehicle(
            @PathVariable Long id,
            @Valid @RequestBody VehicleRequest request,
            Authentication authentication
    ) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new IllegalArgumentException("User not found."));

        Vehicle updatedVehicle = VehicleMapper.toEntity(request);
        Vehicle vehicle = vehicleService.updateVehicleForDriver(user.getId(), id, updatedVehicle);

        return ResponseEntity.ok(VehicleMapper.toResponse(vehicle));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('DRIVER')")
    public ResponseEntity<Void> deleteVehicle(
            @PathVariable Long id,
            Authentication authentication
    ) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new IllegalArgumentException("User not found."));

        vehicleService.deleteVehicleForDriver(user.getId(), id);
        return ResponseEntity.noContent().build();
    }
}