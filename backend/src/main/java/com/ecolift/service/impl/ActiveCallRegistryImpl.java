package com.ecolift.service.impl;

import com.ecolift.service.ActiveCallRegistry;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class ActiveCallRegistryImpl implements ActiveCallRegistry {
    private final Map<String, Long> activeCalls = new ConcurrentHashMap<>();

    @Override
    public boolean tryStartCall(String userId, Long bookingId) {
        return activeCalls.putIfAbsent(userId, bookingId) == null;
    }

    @Override
    public void endCall(String userId) {
        activeCalls.remove(userId);
    }

    @Override
    public boolean isUserInCall(String userId) {
        return activeCalls.containsKey(userId);
    }
}
