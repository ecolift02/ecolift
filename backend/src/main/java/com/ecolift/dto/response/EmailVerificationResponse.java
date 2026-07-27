package com.ecolift.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class EmailVerificationResponse {
    private Boolean success;

    private String message;

    @JsonProperty("isVerified")
    private Boolean isVerified;
}
