package com.ecolift.exception;

/** Thrown when a submitted OTP is wrong, expired, already used, or missing. */
public class InvalidOtpException extends RuntimeException {
    public InvalidOtpException(String message) {
        super(message);
    }
}
