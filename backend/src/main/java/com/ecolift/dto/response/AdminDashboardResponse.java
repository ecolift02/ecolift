package com.ecolift.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Platform-wide statistics for the Admin Dashboard (Admin Management Module - Module 1).
 *
 * The named fields cover the statistics requested today. `additionalStats` is an
 * open-ended extension point so new stats can be added later without breaking
 * existing clients or requiring a new response type.
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AdminDashboardResponse {
    private LocalDateTime generatedAt;

    private Long totalUsers;
    private Long totalDrivers;
    private Long totalPassengers;

    private Long totalVehicles;
    private Long pendingVehicleVerifications;
    private Long approvedVehicles;
    private Long rejectedVehicles;

    private Long totalPublishedRides;
    private Long activeRides;
    private Long completedRides;
    private Long cancelledRides;

    private Long totalBookings;

    // Extension point: add new statistics here without changing the response shape.
    private Map<String, Long> additionalStats;
}
