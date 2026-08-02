package com.ecolift.mapper;

import com.ecolift.dto.response.AdminRideResponse;
import com.ecolift.dto.response.AdminUserResponse;
import com.ecolift.entity.Ride;
import com.ecolift.entity.Role;
import com.ecolift.entity.User;

import java.time.LocalDateTime;
import java.util.stream.Collectors;

public class AdminMapper {

    public static AdminUserResponse toUserResponse(User user) {
        return AdminUserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .gender(user.getGender())
                .dateOfBirth(user.getDateOfBirth())
                .createdAt(user.getCreatedAt())
                .currentMode(user.getCurrentMode())
                .roles(user.getRoles().stream().map(Role::getName).collect(Collectors.toList()))
                .isSuspended(Boolean.TRUE.equals(user.getIsDeleted()))
                .build();
    }

    public static AdminRideResponse toRideResponse(Ride ride) {
        return AdminRideResponse.builder()
                .rideId(ride.getId())
                .driverId(ride.getDriver() != null ? ride.getDriver().getId() : null)
                .driverName(ride.getDriver() != null ? ride.getDriver().getName() : "Unknown")
                .vehicleId(ride.getVehicle() != null ? ride.getVehicle().getId() : null)
                .vehicleModel(ride.getVehicle() != null
                        ? ride.getVehicle().getManufacturer() + " " + ride.getVehicle().getModel()
                        : "Unknown")
                .vehicleLicensePlate(ride.getVehicle() != null ? ride.getVehicle().getLicensePlate() : "Unknown")
                .departureLocationName(ride.getRoute().getDepartureLocationName() != null ? ride.getRoute().getDepartureLocationName() : "Unknown")
                .arrivalLocationName(ride.getRoute().getArrivalLocationName() != null ? ride.getRoute().getArrivalLocationName() : "Unknown")
                .departureTime(ride.getDepartureTime())
                .estimateArrivalTime(ride.getEstimateArrivalTime())
                .availableSeats(ride.getAvailableSeats())
                .pricePerSeat(ride.getPricePerSeat())
                .rideStatus(computeRideStatus(ride))
                .build();
    }

    /**
     * Ride has no persisted status column, only isDeleted (used as the
     * cancellation flag). Status shown to admins is derived at read time:
     * CANCELLED > COMPLETED (departure already passed) > ACTIVE (upcoming).
     */
    public static String computeRideStatus(Ride ride) {
        if (Boolean.TRUE.equals(ride.getIsDeleted())) {
            return "CANCELLED";
        }
        if (ride.getDepartureTime() != null && ride.getDepartureTime().isBefore(LocalDateTime.now())) {
            return "COMPLETED";
        }
        return "ACTIVE";
    }
}
