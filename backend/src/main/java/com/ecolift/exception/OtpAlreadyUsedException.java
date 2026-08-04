package com.ecolift.exception;

/** Thrown when an OTP that was already redeemed is submitted again (replay). */
public class OtpAlreadyUsedException extends RuntimeException {
    public OtpAlreadyUsedException(String message) {
        super(message);
    }
}
