package com.ecolift.service;

import com.ecolift.dto.request.AuthRequest;
import com.ecolift.dto.request.RegisterRequest;
import com.ecolift.dto.response.AuthResponse;
import com.ecolift.entity.OtpPurpose;
import com.ecolift.entity.Role;
import com.ecolift.entity.User;
import com.ecolift.entity.UserMode;
import com.ecolift.exception.EmailNotVerifiedException;
import com.ecolift.repository.RoleRepository;
import com.ecolift.repository.UserRepository;
import com.ecolift.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final OtpService otpService;

    /**
     * Registers the user as usual, but DOES NOT log them in / issue a JWT.
     * The account is created with emailVerified = false and a 6-digit OTP is
     * emailed to them. The frontend must call /api/auth/verify-otp with that
     * code before the account can be used to log in.
     */
    @Transactional
    public void register(RegisterRequest request) {
        // 1. Check if user already exists
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email is already in use.");
        }

        // 2. Resolve the role the user actually selected on the registration form
        //    ("DRIVER" or "PASSENGER"). Defaults to PASSENGER if not provided/invalid.
        String requestedRole = request.getRole() != null
                ? request.getRole().trim().toUpperCase()
                : "PASSENGER";

        UserMode initialMode = "DRIVER".equals(requestedRole) ? UserMode.DRIVER : UserMode.PASSENGER;
        String roleName = "DRIVER".equals(requestedRole) ? "DRIVER" : "PASSENGER";

        Role userRole = getOrCreateRole(roleName);

        // 3. Build and save new User - unverified until OTP is confirmed
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .roles(Set.of(userRole))
                .currentMode(initialMode)
                .emailVerified(false)
                .build();

        userRepository.save(user);

        // 4. Fire off the verification OTP by email (does not block on JWT issuance)
        otpService.generateAndSendOtp(user.getEmail(), user.getName(), OtpPurpose.REGISTER);
    }

    /**
     * Confirms the OTP the user typed in after registration, marks the
     * account as verified, and - only now - issues a JWT so they're logged
     * straight in without a second manual login step.
     */
    @Transactional
    public AuthResponse verifyRegistrationOtp(String email, String otp) {
        otpService.verifyOtp(email, otp, OtpPurpose.REGISTER);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        user.setEmailVerified(true);
        userRepository.save(user);

        return generateAuthResponse(user);
    }

    /** Re-sends a registration OTP, e.g. if the first email was lost or expired. */
    public void resendRegistrationOtp(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        if (Boolean.TRUE.equals(user.getEmailVerified())) {
            throw new IllegalArgumentException("This account is already verified.");
        }
        otpService.generateAndSendOtp(user.getEmail(), user.getName(), OtpPurpose.REGISTER);
    }

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

        // 2b. Block login until the email has been verified via OTP.
        if (!Boolean.TRUE.equals(user.getEmailVerified())) {
            throw new EmailNotVerifiedException(
                    "Please verify your email before logging in. Check your inbox for the OTP.");
        }

        return generateAuthResponse(user);
    }

    /**
     * Step 1 of "forgot password": emails a reset OTP if the address exists.
     * Always succeeds from the caller's point of view (no "email exists"
     * leak) - unknown emails are silently no-ops.
     */
    public void forgotPassword(String email) {
        userRepository.findByEmail(email).ifPresent(user ->
                otpService.generateAndSendOtp(user.getEmail(), user.getName(), OtpPurpose.RESET_PASSWORD));
    }

    /** Step 2 of "forgot password": validates the OTP and sets the new password. */
    @Transactional
    public void resetPassword(String email, String otp, String newPassword) {
        otpService.verifyOtp(email, otp, OtpPurpose.RESET_PASSWORD);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    /**
     * Re-issues a fresh JWT (with up-to-date roles) for an already-authenticated user.
     */
    public AuthResponse refreshToken(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return generateAuthResponse(user);
    }

    private Role getOrCreateRole(String name) {
        return roleRepository.findByName(name)
                .orElseGet(() -> {
                    Role role = new Role();
                    role.setName(name);
                    return roleRepository.save(role);
                });
    }

    private AuthResponse generateAuthResponse(User user) {
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