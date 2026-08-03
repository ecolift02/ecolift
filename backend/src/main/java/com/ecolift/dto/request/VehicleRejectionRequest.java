package com.ecolift.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class VehicleRejectionRequest {

    @NotBlank(message = "Rejection reason is required")
    private String reason;
}
