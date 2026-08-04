package com.ecolift.exception;

/** Thrown when the wrong-attempt cap on an OTP row has been exceeded. */
public class TooManyOtpAttemptsException extends RuntimeException {
    public TooManyOtpAttemptsException(String message) {
        super(message);
    }
}
