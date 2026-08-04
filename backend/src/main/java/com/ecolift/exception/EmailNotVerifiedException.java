package com.ecolift.exception;

/** Thrown when a user tries to log in before verifying their email OTP. */
public class EmailNotVerifiedException extends RuntimeException {
    public EmailNotVerifiedException(String message) {
        super(message);
    }
}
