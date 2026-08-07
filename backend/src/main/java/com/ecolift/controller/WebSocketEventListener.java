package com.ecolift.controller;

import com.ecolift.service.ActiveCallRegistry;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

@Component
@RequiredArgsConstructor
public class WebSocketEventListener {

    private final ActiveCallRegistry activeCallRegistry;

    @EventListener
    public void handleSessionDisconnect(SessionDisconnectEvent event) {
        if (event.getUser() == null) {
            return;
        }

        String userId = event.getUser().getName();
        if (userId != null && !userId.isBlank()) {
            activeCallRegistry.endCall(userId);
        }
    }
}
