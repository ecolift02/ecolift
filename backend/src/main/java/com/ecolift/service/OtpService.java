package com.ecolift.service;

import com.ecolift.entity.OtpPurpose;

public interface OtpService {

    /**
     * Generates a fresh 6-digit OTP, stores it (invalidating any earlier
     * unused OTP for the same email+purpose), and emails it to the user.
     */
    void generateAndSendOtp(String email, String name, OtpPurpose purpose);

    /**
     * Validates the OTP typed by the user. Throws InvalidOtpException if it's
     * wrong, expired, already used, or too many attempts were made.
     * On success, marks the OTP row as used so it can't be replayed.
     */
    void verifyOtp(String email, String otp, OtpPurpose purpose);
}
