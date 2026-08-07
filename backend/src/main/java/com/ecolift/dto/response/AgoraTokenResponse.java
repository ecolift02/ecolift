package com.ecolift.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AgoraTokenResponse {
    private String token;
    private String appId;
    private Long expiresAt;
}
