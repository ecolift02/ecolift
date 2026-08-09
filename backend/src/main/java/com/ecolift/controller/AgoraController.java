package com.ecolift.controller;

import com.ecolift.dto.response.AgoraTokenResponse;
import io.agora.media.RtcTokenBuilder2;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/agora")
@CrossOrigin(origins = "http://localhost:5173")
@Slf4j
public class AgoraController {

    @Value("${application.security.agora.app-id:}")
    private String appId;

    @Value("${application.security.agora.app-certificate:}")
    private String appCertificate;

    @GetMapping("/token")
    public ResponseEntity<AgoraTokenResponse> getToken(
            @RequestParam String channelName,
            @RequestParam String uid) {

        if (appId == null || appId.isBlank() || appCertificate == null || appCertificate.isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        int intUid;
        try {
            intUid = Integer.parseInt(uid);
        } catch (NumberFormatException ex) {
            return ResponseEntity.badRequest().build();
        }

        int expireSeconds = 3600;
        RtcTokenBuilder2 tokenBuilder = new RtcTokenBuilder2();
        String token = tokenBuilder.buildTokenWithUid(
                appId,
                appCertificate,
                channelName,
                intUid,
                RtcTokenBuilder2.Role.ROLE_PUBLISHER,
                expireSeconds,
                expireSeconds
        );
        AgoraTokenResponse response = new AgoraTokenResponse(token, appId, (long) expireSeconds);
        return ResponseEntity.ok(response);
    }
}
