package com.ecolift.service;

public interface ActiveCallRegistry {
    boolean tryStartCall(String userId, Long bookingId);
    void endCall(String userId);
    boolean isUserInCall(String userId);
}
