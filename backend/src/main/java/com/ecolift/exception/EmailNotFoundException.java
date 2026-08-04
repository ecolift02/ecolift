package com.ecolift.exception;

/**
 * Thrown when a user record can't be found by email AFTER an OTP has
 * already confirmed the caller owns that inbox (verify-otp, reset-password).
 * Never use this in forgot-password's initial "send code" step — that must
 * stay silent on unknown emails to avoid leaking which addresses are registered.
 */
public class EmailNotFoundException extends RuntimeException {
    public EmailNotFoundException(String message) {
        super(message);
    }
}
