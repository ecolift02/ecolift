package com.ecolift.exception;

/**
 * Thrown for any SMTP/mail delivery failure (connection, auth, timeout, etc).
 * One class, contextual message — covers registration emails, password-reset
 * emails, and resend attempts alike; the underlying failure point is the same.
 */
public class EmailSendingFailedException extends RuntimeException {
    public EmailSendingFailedException(String message) {
        super(message);
    }
}
