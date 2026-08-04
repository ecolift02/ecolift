package com.ecolift.exception;

/** Thrown when registering with an email that's already in use. */
public class DuplicateEmailException extends RuntimeException {
    public DuplicateEmailException(String message) {
        super(message);
    }
}
