package com.ecolift.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Generic { "message": "..." } envelope for endpoints that don't need to
 * return a full resource - e.g. "OTP sent", "Password reset successful".
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MessageResponse {
    private String message;
}
