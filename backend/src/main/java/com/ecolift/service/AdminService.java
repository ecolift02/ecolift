package com.ecolift.service;

import com.ecolift.dto.response.AdminDashboardResponse;
import com.ecolift.dto.response.AdminRideResponse;
import com.ecolift.dto.response.AdminUserResponse;
import com.ecolift.dto.response.BookingResponse;
import com.ecolift.dto.response.VehicleResponse;

import java.util.List;

/**
 * Admin Management Module service. The Admin does not participate in rides;
 * this service only aggregates/reuses the existing User/Vehicle/Ride/Booking
 * services for platform management, verification, and monitoring.
 */
public interface AdminService {

    // Module 1 - Dashboard
    AdminDashboardResponse getDashboard();

    // Module 2 - User Management
    List<AdminUserResponse> getUsers(String search, String role);
    AdminUserResponse getUserById(Long userId);
    void suspendUser(Long userId);
    void activateUser(Long userId);

    // Module 3 - Vehicle Verification
    List<VehicleResponse> getPendingVehicles();
    VehicleResponse approveVehicle(Long vehicleId);
    VehicleResponse rejectVehicle(Long vehicleId, String reason);

    // Module 4 - Ride Monitoring
    List<AdminRideResponse> getRides(String status);
    AdminRideResponse getRideById(Long rideId);

    // Module 5 - Booking Monitoring
    List<BookingResponse> getBookings(String status);
    BookingResponse getBookingById(Long bookingId);
}
