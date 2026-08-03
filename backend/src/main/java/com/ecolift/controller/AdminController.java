package com.ecolift.controller;

import com.ecolift.dto.request.VehicleRejectionRequest;
import com.ecolift.dto.response.AdminDashboardResponse;
import com.ecolift.dto.response.AdminRideResponse;
import com.ecolift.dto.response.AdminUserResponse;
import com.ecolift.dto.response.BookingResponse;
import com.ecolift.dto.response.VehicleResponse;
import com.ecolift.service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Admin Management Module.
 *
 * The Admin does not participate in rides - every endpoint here is
 * platform management/monitoring only, reusing the existing services.
 * All endpoints require the ADMIN role (method-level @PreAuthorize, same
 * pattern already used by every other controller in this project - no
 * SecurityConfig changes were needed).
 */
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    // ---------------- Module 1 - Dashboard ----------------

    @GetMapping("/dashboard")
    public ResponseEntity<AdminDashboardResponse> getDashboard() {
        return ResponseEntity.ok(adminService.getDashboard());
    }

    // ---------------- Module 2 - User Management ----------------

    /**
     * List/search/filter users.
     * Examples: GET /api/admin/users, ?search=john, ?role=DRIVER
     */
    @GetMapping("/users")
    public ResponseEntity<List<AdminUserResponse>> getUsers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String role
    ) {
        return ResponseEntity.ok(adminService.getUsers(search, role));
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<AdminUserResponse> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.getUserById(id));
    }

    @PatchMapping("/users/{id}/suspend")
    public ResponseEntity<Map<String, String>> suspendUser(@PathVariable Long id) {
        adminService.suspendUser(id);
        return ResponseEntity.ok(Map.of("message", "User suspended successfully."));
    }

    @PatchMapping("/users/{id}/activate")
    public ResponseEntity<Map<String, String>> activateUser(@PathVariable Long id) {
        adminService.activateUser(id);
        return ResponseEntity.ok(Map.of("message", "User activated successfully."));
    }

    // ---------------- Module 3 - Vehicle Verification ----------------

    @GetMapping("/vehicles/pending")
    public ResponseEntity<List<VehicleResponse>> getPendingVehicles() {
        return ResponseEntity.ok(adminService.getPendingVehicles());
    }

    @PatchMapping("/vehicles/{id}/approve")
    public ResponseEntity<VehicleResponse> approveVehicle(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.approveVehicle(id));
    }

    @PatchMapping("/vehicles/{id}/reject")
    public ResponseEntity<VehicleResponse> rejectVehicle(
            @PathVariable Long id,
            @Valid @RequestBody VehicleRejectionRequest request
    ) {
        return ResponseEntity.ok(adminService.rejectVehicle(id, request.getReason()));
    }

    // ---------------- Module 4 - Ride Monitoring ----------------

    /**
     * All rides, optionally filtered by derived status.
     * Example: GET /api/admin/rides?status=ACTIVE (ACTIVE | COMPLETED | CANCELLED)
     */
    @GetMapping("/rides")
    public ResponseEntity<List<AdminRideResponse>> getRides(@RequestParam(required = false) String status) {
        return ResponseEntity.ok(adminService.getRides(status));
    }

    @GetMapping("/rides/{id}")
    public ResponseEntity<AdminRideResponse> getRideById(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.getRideById(id));
    }

    // ---------------- Module 5 - Booking Monitoring ----------------

    /**
     * All bookings, optionally filtered by status.
     * Example: GET /api/admin/bookings?status=PENDING
     */
    @GetMapping("/bookings")
    public ResponseEntity<List<BookingResponse>> getBookings(@RequestParam(required = false) String status) {
        return ResponseEntity.ok(adminService.getBookings(status));
    }

    @GetMapping("/bookings/{id}")
    public ResponseEntity<BookingResponse> getBookingById(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.getBookingById(id));
    }
}
