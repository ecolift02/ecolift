package com.ecolift.exception;

/**
 * Thrown when sending an email (OTP, notifications, etc.) fails - e.g. bad
 * SMTP credentials, host unreachable, or Gmail rejecting the app password.
 * Kept separate from a generic RuntimeException so GlobalExceptionHandler
 * can return a specific, debuggable message instead of the generic
 * "contact support" fallback.
 */
public class EmailSendException extends RuntimeException {
    public EmailSendException(String message, Throwable cause) {
        super(message, cause);
    }
}
