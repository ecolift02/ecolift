package com.ecolift.exception;

/** Thrown when a submitted OTP is correct in form but past its expiry time. */
public class OtpExpiredException extends RuntimeException {
    public OtpExpiredException(String message) {
        super(message);
    }
}
