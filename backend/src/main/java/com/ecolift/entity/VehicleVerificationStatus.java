package com.ecolift.entity;

/**
 * Admin verification workflow status for a Vehicle (Admin Management Module - Module 3).
 *
 * PENDING  -> vehicle just registered by a driver, awaiting admin review.
 * APPROVED -> admin approved the vehicle; it may be used to publish rides.
 * REJECTED -> admin rejected the vehicle; see Vehicle.rejectionReason.
 *             The driver may edit and resubmit, which moves it back to PENDING.
 */
public enum VehicleVerificationStatus {
    PENDING,
    APPROVED,
    REJECTED
}
