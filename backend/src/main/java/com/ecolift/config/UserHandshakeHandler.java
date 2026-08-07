package com.ecolift.config;

import org.springframework.http.server.ServerHttpRequest;
import org.springframework.web.socket.server.support.DefaultHandshakeHandler;

import java.security.Principal;
import java.util.Map;

public class UserHandshakeHandler extends DefaultHandshakeHandler {

    @Override
    protected Principal determineUser(ServerHttpRequest request, org.springframework.web.socket.WebSocketHandler wsHandler,
            Map<String, Object> attributes) {
        Object email = attributes.get("email");
        return email == null ? null : () -> email.toString();
    }
}
