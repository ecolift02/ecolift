package com.ecolift.service;

import com.ecolift.dto.request.AuthRequest;
import com.ecolift.dto.request.ForgotPasswordRequest;
import com.ecolift.dto.request.OTPVerificationRequest;
import com.ecolift.dto.request.RegisterRequest;
import com.ecolift.dto.request.ResetPasswordRequest;
import com.ecolift.dto.response.AuthResponse;
import com.ecolift.dto.response.OTPResponse;
import com.ecolift.entity.Role;
import com.ecolift.entity.User;
import com.ecolift.repository.RoleRepository;
import com.ecolift.repository.UserRepository;
import com.ecolift.security.JwtService;
import java.time.LocalDateTime;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final OTPService otpService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // 1. Check if user already exists
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email is already in use.");
        }

        // 2. Fetch default role (USER)
        Role userRole = roleRepository.findByName("USER")
                .orElseThrow(() -> new RuntimeException("Error: Default Role not found."));

        // 3. Build and save new User with email unverified
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .roles(Set.of(userRole))
                .isEmailVerified(false)
                .build();

        userRepository.save(user);

        log.info("User registered with email: {} (awaiting email verification)", request.getEmail());

        // 4. Generate JWT and map to response (but user cannot login until email is verified)
        return generateAuthResponse(user);
    }

    /**
     * Step 1: Register user and send OTP for email verification
     */
    @Transactional
    public OTPResponse registerStep1(RegisterRequest request) {
        // 1. Check if user already exists
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return OTPResponse.builder()
                    .success(false)
                    .message("Email is already in use.")
                    .build();
        }

        // 2. Fetch default role (USER)
        Role userRole = roleRepository.findByName("USER")
                .orElseThrow(() -> new RuntimeException("Error: Default Role not found."));

        // 3. Build and save new User (not verified yet)
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .roles(Set.of(userRole))
                .isEmailVerified(false)
                .build();

        userRepository.save(user);

        // 4. Send OTP to email
        OTPResponse otpResponse = otpService.sendOTPForRegistration(request.getEmail());

        log.info("Registration step 1 completed for email: {}", request.getEmail());
        return otpResponse;
    }

    /**
     * Step 2: Verify email with OTP and complete registration
     */
    @Transactional
    public AuthResponse verifyEmailAndCompleteRegistration(OTPVerificationRequest request) {
        // 1. Verify OTP
        OTPResponse otpResponse = otpService.verifyOTP(request.getEmail(), request.getCode());

        if (!otpResponse.getSuccess()) {
            throw new IllegalArgumentException(otpResponse.getMessage());
        }

        // 2. Find user and mark email as verified
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        user.setIsEmailVerified(true);
        user.setEmailVerifiedAt(LocalDateTime.now());
        userRepository.save(user);

        // 3. Clear OTP
        otpService.clearOTP(request.getEmail());

        log.info("Email verified successfully for: {}", request.getEmail());

        // 4. Generate JWT and return auth response
        return generateAuthResponse(user);
    }

    /**
     * Login with OTP: Verify password and send OTP
     */
    @Transactional
    public OTPResponse loginWithOTP(AuthRequest request) {
        try {
            // 1. Authenticate credentials via Spring Security
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()
                    )
            );

            // 2. Fetch user
            User user = userRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

            // 3. Check if email is verified
            if (!user.getIsEmailVerified()) {
                return OTPResponse.builder()
                        .success(false)
                        .message("Please verify your email first")
                        .build();
            }

            // 4. Send OTP to email
            OTPResponse otpResponse = otpService.sendOTPForRegistration(request.getEmail());

            log.info("Login OTP sent to: {}", request.getEmail());
            return otpResponse;
        } catch (Exception e) {
            log.error("Error during login with OTP for email: {}", request.getEmail(), e);
            return OTPResponse.builder()
                    .success(false)
                    .message("Invalid email or password")
                    .build();
        }
    }

    /**
     * Complete login by verifying OTP
     */
    @Transactional
    public AuthResponse completeLoginWithOTP(OTPVerificationRequest request) {
        // 1. Verify OTP
        OTPResponse otpResponse = otpService.verifyOTP(request.getEmail(), request.getCode());

        if (!otpResponse.getSuccess()) {
            throw new IllegalArgumentException(otpResponse.getMessage());
        }

        // 2. Find user
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // 3. Clear OTP
        otpService.clearOTP(request.getEmail());

        log.info("Login completed successfully for: {}", request.getEmail());

        // 4. Generate JWT and return auth response
        return generateAuthResponse(user);
    }

    /**
     * Request password reset: Send OTP to email
     */
    @Transactional
    public OTPResponse requestPasswordReset(ForgotPasswordRequest request) {
        // 1. Check if user exists
        User user = userRepository.findByEmail(request.getEmail())
                .orElse(null);

        if (user == null) {
            // For security, don't reveal if email exists
            return OTPResponse.builder()
                    .success(true)
                    .message("If the email exists, OTP has been sent")
                    .build();
        }

        // 2. Send OTP for password reset
        OTPResponse otpResponse = otpService.sendOTPForPasswordReset(request.getEmail());

        log.info("Password reset OTP sent to: {}", request.getEmail());
        return otpResponse;
    }

    /**
     * Resend OTP for registration (for users who didn't receive the first OTP)
     */
    @Transactional
    public OTPResponse resendRegistrationOTP(String email) {
        try {
            log.info("Resending registration OTP to: {}", email);
            
            // Check if user exists
            User user = userRepository.findByEmail(email)
                    .orElse(null);

            if (user == null) {
                return OTPResponse.builder()
                        .success(false)
                        .message("User not found. Please register first.")
                        .build();
            }

            // Resend OTP
            OTPResponse otpResponse = otpService.resendOTP(email);
            
            log.info("Resend OTP completed for: {}", email);
            return otpResponse;
        } catch (Exception e) {
            log.error("Error resending OTP for email: {}", email, e);
            return OTPResponse.builder()
                    .success(false)
                    .message("Failed to resend OTP: " + e.getMessage())
                    .build();
        }
    }

    /**
     * Verify reset OTP
     */
    @Transactional
    public OTPResponse verifyResetOTP(OTPVerificationRequest request) {
        // 1. Verify OTP
        OTPResponse otpResponse = otpService.verifyOTP(request.getEmail(), request.getCode());

        if (!otpResponse.getSuccess()) {
            throw new IllegalArgumentException(otpResponse.getMessage());
        }

        log.info("Reset OTP verified for: {}", request.getEmail());
        return otpResponse;
    }

    /**
     * Reset password
     */
    @Transactional
    public AuthResponse resetPassword(ResetPasswordRequest request) {
        // 1. Validate passwords match
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Passwords do not match");
        }

        // 2. Verify OTP first
        OTPResponse otpResponse = otpService.verifyOTP(request.getEmail(), request.getOtp());

        if (!otpResponse.getSuccess()) {
            throw new IllegalArgumentException("Invalid or expired OTP");
        }

        // 3. Find user and update password
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        // 4. Clear OTP
        otpService.clearOTP(request.getEmail());

        log.info("Password reset completed for: {}", request.getEmail());

        // 5. Generate JWT and return auth response
        return generateAuthResponse(user);
    }

    /**
     * Original authenticate method (kept for backward compatibility)
     */
    public AuthResponse authenticate(AuthRequest request) {
        // 1. Authenticate credentials via Spring Security
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        // 2. Fetch user and generate JWT
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

        // 3. Check if email is verified
        if (!user.getIsEmailVerified()) {
            throw new IllegalArgumentException("Please verify your email first");
        }

        return generateAuthResponse(user);
    }

    private AuthResponse generateAuthResponse(User user) {
        // We pass the Spring Security UserDetails representation to our JwtService
        org.springframework.security.core.userdetails.User springUser =
                new org.springframework.security.core.userdetails.User(
                        user.getEmail(),
                        user.getPassword(),
                        user.getRoles().stream()
                                .map(role -> new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_" + role.getName()))
                                .collect(Collectors.toList())
                );

        String jwtToken = jwtService.generateToken(springUser);

        return AuthResponse.builder()
                .token(jwtToken)
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .roles(user.getRoles().stream().map(Role::getName).collect(Collectors.toList()))
                .build();
    }
}