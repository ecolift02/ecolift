package com.ecolift.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ResendOtpRequest {
    @NotBlank(message = "Email is required")
    @Email(message = "Email must be properly formatted")
    private String email;

    // "REGISTER" or "RESET_PASSWORD" - which flow this resend is for.
    @NotBlank(message = "Purpose is required")
    private String purpose;
}
