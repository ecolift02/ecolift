package com.ecolift.service;

public interface EmailService {

    /** Sends the "verify your account" OTP after registration. */
    void sendRegistrationOtp(String toEmail, String name, String otp);

    /** Sends the "reset your password" OTP for the forgot-password flow. */
    void sendPasswordResetOtp(String toEmail, String name, String otp);
}
