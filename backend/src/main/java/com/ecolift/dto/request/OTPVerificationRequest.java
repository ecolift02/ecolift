package com.ecolift.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OTPVerificationRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    private String otp;
    private String code;

    /**
     * Helper method to return whichever field was populated by the JSON payload.
     */
    public String getCode() {
        if (code != null && !code.isBlank()) {
            return code;
        }
        return otp;
    }

    public String getOtp() {
        return getCode();
    }
}