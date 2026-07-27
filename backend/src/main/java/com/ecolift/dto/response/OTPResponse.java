package com.ecolift.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class OTPResponse {
    private Boolean success;

    private String message;

    @JsonProperty("expiresAt")
    private LocalDateTime expiresAt;

    @JsonProperty("isVerified")
    private Boolean isVerified;
}
