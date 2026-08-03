package com.ecolift.service.impl;

import com.ecolift.dto.response.AdminDashboardResponse;
import com.ecolift.dto.response.AdminRideResponse;
import com.ecolift.dto.response.AdminUserResponse;
import com.ecolift.dto.response.BookingResponse;
import com.ecolift.dto.response.VehicleResponse;
import com.ecolift.entity.Booking;
import com.ecolift.entity.Ride;
import com.ecolift.entity.User;
import com.ecolift.entity.Vehicle;
import com.ecolift.entity.VehicleVerificationStatus;
import com.ecolift.mapper.AdminMapper;
import com.ecolift.mapper.BookingMapper;
import com.ecolift.mapper.VehicleMapper;
import com.ecolift.repository.BookingRepository;
import com.ecolift.repository.UserRepository;
import com.ecolift.service.AdminService;
import com.ecolift.service.BookingService;
import com.ecolift.service.RideService;
import com.ecolift.service.UserService;
import com.ecolift.service.VehicleService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Admin Management Module service implementation.
 *
 * This deliberately reuses the existing UserService / VehicleService /
 * RideService / BookingService rather than bypassing them with new
 * repository calls, so all existing business rules (soft-delete semantics,
 * validation, etc.) keep applying exactly as before. Only the additional
 * repository query methods (search/filter/count) added alongside this module
 * are used directly.
 */
@Service
@Transactional
public class AdminServiceImpl implements AdminService {

    private final UserService userService;
    private final VehicleService vehicleService;
    private final RideService rideService;
    private final BookingService bookingService;
    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;

    public AdminServiceImpl(
            UserService userService,
            VehicleService vehicleService,
            RideService rideService,
            BookingService bookingService,
            UserRepository userRepository,
            BookingRepository bookingRepository
    ) {
        this.userService = userService;
        this.vehicleService = vehicleService;
        this.rideService = rideService;
        this.bookingService = bookingService;
        this.userRepository = userRepository;
        this.bookingRepository = bookingRepository;
    }

    // ---------------- Module 1 - Dashboard ----------------

    @Override
    @Transactional(readOnly = true)
    public AdminDashboardResponse getDashboard() {
        long totalDrivers = userRepository.countByRoles_NameIgnoreCase("DRIVER");
        long totalPassengers = userRepository.countByRoles_NameIgnoreCase("PASSENGER");

        long pendingVehicles = vehicleService.countByVerificationStatus(VehicleVerificationStatus.PENDING);
        long approvedVehicles = vehicleService.countByVerificationStatus(VehicleVerificationStatus.APPROVED);
        long rejectedVehicles = vehicleService.countByVerificationStatus(VehicleVerificationStatus.REJECTED);

        // Ride has no persisted status column, so active/completed/cancelled
        // counts are derived the same way AdminMapper.computeRideStatus does.
        List<Ride> allRides = rideService.findAll();
        long cancelledRides = allRides.stream().filter(r -> Boolean.TRUE.equals(r.getIsDeleted())).count();
        long completedRides = allRides.stream()
                .filter(r -> !Boolean.TRUE.equals(r.getIsDeleted()))
                .filter(r -> r.getDepartureTime() != null && r.getDepartureTime().isBefore(LocalDateTime.now()))
                .count();
        long activeRides = allRides.size() - cancelledRides - completedRides;

        return AdminDashboardResponse.builder()
                .generatedAt(LocalDateTime.now())
                .totalUsers(userService.count())
                .totalDrivers(totalDrivers)
                .totalPassengers(totalPassengers)
                .totalVehicles(vehicleService.count())
                .pendingVehicleVerifications(pendingVehicles)
                .approvedVehicles(approvedVehicles)
                .rejectedVehicles(rejectedVehicles)
                .totalPublishedRides((long) allRides.size())
                .activeRides(activeRides)
                .completedRides(completedRides)
                .cancelledRides(cancelledRides)
                .totalBookings(bookingService.count())
                .additionalStats(java.util.Map.of())
                .build();
    }

    // ---------------- Module 2 - User Management ----------------

    @Override
    @Transactional(readOnly = true)
    public List<AdminUserResponse> getUsers(String search, String role) {
        List<User> users;
        if (search != null && !search.isBlank()) {
            users = userRepository.searchUsers(search.trim());
        } else if (role != null && !role.isBlank()) {
            users = userRepository.findByRoles_NameIgnoreCase(role.trim());
        } else {
            users = userService.findAll();
        }

        // If both search and role were provided, narrow the search results by role too.
        if (search != null && !search.isBlank() && role != null && !role.isBlank()) {
            String roleFilter = role.trim();
            users = users.stream()
                    .filter(u -> u.getRoles().stream().anyMatch(r -> r.getName().equalsIgnoreCase(roleFilter)))
                    .collect(Collectors.toList());
        }

        return users.stream()
                .sorted(Comparator.comparing(User::getId))
                .map(AdminMapper::toUserResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public AdminUserResponse getUserById(Long userId) {
        return AdminMapper.toUserResponse(userService.findById(userId));
    }

    @Override
    public void suspendUser(Long userId) {
        // Reuses the existing deactivateUser logic as-is (isDeleted = true).
        userService.deactivateUser(userId);
    }

    @Override
    public void activateUser(Long userId) {
        userService.activateUser(userId);
    }

    // ---------------- Module 3 - Vehicle Verification ----------------

    @Override
    @Transactional(readOnly = true)
    public List<VehicleResponse> getPendingVehicles() {
        return vehicleService.getVehiclesByVerificationStatus(VehicleVerificationStatus.PENDING)
                .stream()
                .map(VehicleMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public VehicleResponse approveVehicle(Long vehicleId) {
        Vehicle vehicle = vehicleService.approveVehicle(vehicleId);
        return VehicleMapper.toResponse(vehicle);
    }

    @Override
    public VehicleResponse rejectVehicle(Long vehicleId, String reason) {
        Vehicle vehicle = vehicleService.rejectVehicle(vehicleId, reason);
        return VehicleMapper.toResponse(vehicle);
    }

    // ---------------- Module 4 - Ride Monitoring ----------------

    @Override
    @Transactional(readOnly = true)
    public List<AdminRideResponse> getRides(String status) {
        List<Ride> rides = rideService.findAll();

        if (status != null && !status.isBlank()) {
            String normalized = status.trim().toUpperCase();
            rides = rides.stream()
                    .filter(r -> AdminMapper.computeRideStatus(r).equals(normalized))
                    .collect(Collectors.toList());
        }

        return rides.stream()
                .sorted(Comparator.comparing(Ride::getId).reversed())
                .map(AdminMapper::toRideResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public AdminRideResponse getRideById(Long rideId) {
        return AdminMapper.toRideResponse(rideService.findById(rideId));
    }

    // ---------------- Module 5 - Booking Monitoring ----------------

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponse> getBookings(String status) {
        List<Booking> bookings;
        if (status != null && !status.isBlank()) {
            Booking.BookingStatus parsedStatus;
            try {
                parsedStatus = Booking.BookingStatus.valueOf(status.trim().toUpperCase());
            } catch (IllegalArgumentException ex) {
                throw new IllegalArgumentException("Invalid booking status: " + status);
            }
            bookings = bookingRepository.findByStatus(parsedStatus);
        } else {
            bookings = bookingService.findAll();
        }

        return bookings.stream()
                .sorted(Comparator.comparing(Booking::getId).reversed())
                .map(BookingMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public BookingResponse getBookingById(Long bookingId) {
        return BookingMapper.toResponse(bookingService.findById(bookingId));
    }
}
