package com.ecolift.exception;

/** Thrown when resending a registration OTP for an account already verified. */
public class EmailAlreadyVerifiedException extends RuntimeException {
    public EmailAlreadyVerifiedException(String message) {
        super(message);
    }
}
