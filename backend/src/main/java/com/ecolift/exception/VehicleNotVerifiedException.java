package com.ecolift.exception;

public class VehicleNotVerifiedException extends RuntimeException {
    public VehicleNotVerifiedException(String message) {
        super(message);
    }

    public VehicleNotVerifiedException(String message, Throwable cause) {
        super(message, cause);
    }
}