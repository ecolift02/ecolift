package com.ecolift.exception;

/** Thrown when an uploaded file (e.g. profile picture) fails type/size validation. */
public class InvalidFileException extends RuntimeException {
    public InvalidFileException(String message) {
        super(message);
    }
}
