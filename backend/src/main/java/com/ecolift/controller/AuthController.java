package com.ecolift.controller;

import com.ecolift.dto.request.AuthRequest;
import com.ecolift.dto.request.ForgotPasswordRequest;
import com.ecolift.dto.request.OTPVerificationRequest;
import com.ecolift.dto.request.RegisterRequest;
import com.ecolift.dto.request.ResetPasswordRequest;
import com.ecolift.dto.response.AuthResponse;
import com.ecolift.dto.response.OTPResponse;
import com.ecolift.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        try {
            AuthResponse response = authService.register(request);
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            log.warn("Registration failed for {}: {}", request.getEmail(), e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        } catch (Exception e) {
            log.error("Registration error for {}: {}", request.getEmail(), e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/register-step1")
    public ResponseEntity<OTPResponse> registerStep1(@Valid @RequestBody RegisterRequest request) {
        try {
            log.info("Registration step 1 initiated for email: {}", request.getEmail());
            OTPResponse response = authService.registerStep1(request);
            return new ResponseEntity<>(response, response.getSuccess() ? HttpStatus.OK : HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            log.error("Error during registration step 1 for {}: {}", request.getEmail(), e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(OTPResponse.builder()
                            .success(false)
                            .message("Failed to send verification code")
                            .build());
        }
    }

    @PostMapping("/verify-email")
    public ResponseEntity<AuthResponse> verifyEmailAndCompleteRegistration(
            @Valid @RequestBody OTPVerificationRequest request) {
        try {
            log.info("Email verification initiated for: {}", request.getEmail());
            AuthResponse response = authService.verifyEmailAndCompleteRegistration(request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            log.warn("Email verification failed for {}: {}", request.getEmail(), e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        } catch (Exception e) {
            log.error("Error during email verification for {}: {}", request.getEmail(), e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<OTPResponse> resendOTP(@Valid @RequestBody AuthRequest request) {
        try {
            log.info("Resend OTP initiated for email: {}", request.getEmail());
            OTPResponse response = authService.resendRegistrationOTP(request.getEmail());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error resending OTP for {}: {}", request.getEmail(), e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(OTPResponse.builder()
                            .success(false)
                            .message("Failed to resend OTP")
                            .build());
        }
    }

    @PostMapping("/login-step1")
    public ResponseEntity<OTPResponse> loginStep1(@Valid @RequestBody AuthRequest request) {
        try {
            log.info("Login step 1 initiated for email: {}", request.getEmail());
            OTPResponse response = authService.loginWithOTP(request);
            return new ResponseEntity<>(response, response.getSuccess() ? HttpStatus.OK : HttpStatus.UNAUTHORIZED);
        } catch (Exception e) {
            log.error("Error during login step 1 for {}: {}", request.getEmail(), e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(OTPResponse.builder()
                            .success(false)
                            .message("Invalid email or password")
                            .build());
        }
    }

    @PostMapping("/login-step2")
    public ResponseEntity<AuthResponse> loginStep2(@Valid @RequestBody OTPVerificationRequest request) {
        try {
            log.info("Login step 2 initiated for email: {}", request.getEmail());
            AuthResponse response = authService.completeLoginWithOTP(request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            log.warn("OTP verification failed for {}: {}", request.getEmail(), e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        } catch (Exception e) {
            log.error("Error during login step 2 for {}: {}", request.getEmail(), e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/login")
    public ResponseEntity<OTPResponse> authenticate(@Valid @RequestBody AuthRequest request) {
        try {
            OTPResponse response = authService.loginWithOTP(request);
            return new ResponseEntity<>(response, response.getSuccess() ? HttpStatus.OK : HttpStatus.UNAUTHORIZED);
        } catch (Exception e) {
            log.error("Login error for {}: {}", request.getEmail(), e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(OTPResponse.builder()
                            .success(false)
                            .message("Login failed")
                            .build());
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<OTPResponse> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        try {
            log.info("Forgot password initiated for email: {}", request.getEmail());
            OTPResponse response = authService.requestPasswordReset(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error during forgot password for {}: {}", request.getEmail(), e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(OTPResponse.builder()
                            .success(false)
                            .message("Failed to process password reset")
                            .build());
        }
    }

    @PostMapping("/verify-reset-otp")
    public ResponseEntity<OTPResponse> verifyResetOTP(@Valid @RequestBody OTPVerificationRequest request) {
        try {
            log.info("Reset OTP verification initiated for: {}", request.getEmail());
            OTPResponse response = authService.verifyResetOTP(request);
            return new ResponseEntity<>(response, response.getSuccess() ? HttpStatus.OK : HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            log.error("Error verifying reset OTP for {}: {}", request.getEmail(), e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(OTPResponse.builder()
                            .success(false)
                            .message("OTP verification failed")
                            .build());
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<AuthResponse> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        try {
            log.info("Password reset initiated for: {}", request.getEmail());
            AuthResponse response = authService.resetPassword(request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            log.warn("Password reset validation failed for {}: {}", request.getEmail(), e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        } catch (Exception e) {
            log.error("Error during password reset for {}: {}", request.getEmail(), e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Re-issues a fresh JWT (with up-to-date roles) for the currently logged-in user.
     * Call this after any action that can change a user's roles mid-session
     * (e.g. registering a vehicle grants the DRIVER role) so the frontend doesn't
     * need to force a logout/login to pick up the new permissions.
     */
    @GetMapping("/refresh")
    @org.springframework.security.access.prepost.PreAuthorize("isAuthenticated()")
    public ResponseEntity<AuthResponse> refresh(org.springframework.security.core.Authentication authentication) {
        AuthResponse response = authService.refreshToken(authentication.getName());
        return ResponseEntity.ok(response);
    }
}