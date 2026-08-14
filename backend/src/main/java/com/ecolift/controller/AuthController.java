package com.ecolift.controller;

import com.ecolift.dto.request.AuthRequest;
import com.ecolift.dto.request.ForgotPasswordRequest;
import com.ecolift.dto.request.RegisterRequest;
import com.ecolift.dto.request.ResendOtpRequest;
import com.ecolift.dto.request.ResetPasswordRequest;
import com.ecolift.dto.request.VerifyOtpRequest;
import com.ecolift.dto.response.AuthResponse;
import com.ecolift.dto.response.MessageResponse;
import com.ecolift.entity.OtpPurpose;
import com.ecolift.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "https://ecolift-2jxv.onrender.com"})
    public class AuthController {

    private final AuthService authService;

    /**
     * Creates the account but does NOT log the user in yet - an OTP is
     * emailed to them first. Frontend should redirect to the OTP screen.
     */
    @PostMapping("/register")
    public ResponseEntity<MessageResponse> register(@Valid @RequestBody RegisterRequest request) {
        authService.register(request);
        return new ResponseEntity<>(
                MessageResponse.builder()
                        .message("Registration successful. Please check your email for the verification OTP.")
                        .build(),
                HttpStatus.CREATED);
    }

    /** Confirms the OTP from /register and, on success, logs the user in (returns a JWT). */
    @PostMapping("/verify-otp")
    public ResponseEntity<AuthResponse> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        AuthResponse response = authService.verifyRegistrationOtp(request.getEmail(), request.getOtp());
        return ResponseEntity.ok(response);
    }

    /** Resends an OTP for either the REGISTER or RESET_PASSWORD flow. */
    @PostMapping("/resend-otp")
    public ResponseEntity<MessageResponse> resendOtp(@Valid @RequestBody ResendOtpRequest request) {
        OtpPurpose purpose = OtpPurpose.valueOf(request.getPurpose().trim().toUpperCase());
        if (purpose == OtpPurpose.REGISTER) {
            authService.resendRegistrationOtp(request.getEmail());
        } else {
            authService.forgotPassword(request.getEmail());
        }
        return ResponseEntity.ok(MessageResponse.builder().message("OTP resent. Please check your email.").build());
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> authenticate(@Valid @RequestBody AuthRequest request) {
        AuthResponse response = authService.authenticate(request);
        return ResponseEntity.ok(response);
    }

    /** Step 1 of forgot-password: emails a reset OTP if the account exists. */
    @PostMapping("/forgot-password")
    public ResponseEntity<MessageResponse> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request.getEmail());
        return ResponseEntity.ok(MessageResponse.builder()
                .message("If an account exists for that email, a reset OTP has been sent.")
                .build());
    }

    /** Step 2 of forgot-password: validates the OTP and sets the new password. */
    @PostMapping("/reset-password")
    public ResponseEntity<MessageResponse> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request.getEmail(), request.getOtp(), request.getNewPassword());
        return ResponseEntity.ok(MessageResponse.builder()
                .message("Password reset successful. You can now log in with your new password.")
                .build());
    }

    /**
     * Re-issues a fresh JWT (with up-to-date roles) for the currently logged-in user.
     */
    @GetMapping("/refresh")
    @org.springframework.security.access.prepost.PreAuthorize("isAuthenticated()")
    public ResponseEntity<AuthResponse> refresh(org.springframework.security.core.Authentication authentication) {
        AuthResponse response = authService.refreshToken(authentication.getName());
        return ResponseEntity.ok(response);
    }
}
