package com.ecolift.service;

import com.ecolift.dto.response.OTPResponse;
import com.ecolift.entity.OTP;
import com.ecolift.repository.OTPRepository;
import java.time.LocalDateTime;
import java.util.Random;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class OTPService {

    private final OTPRepository otpRepository;
    private final EmailService emailService;
    private final Random random = new Random();

    @Value("${app.otp.expiry:300}")
    private long otpExpirySeconds;

    @Value("${app.otp.max-attempts:5}")
    private int maxAttempts;

    /**
     * Generates a 6-digit OTP code
     */
    public String generateOTP() {
        int otp = 100000 + random.nextInt(900000);
        return String.valueOf(otp);
    }

    /**
     * Sends OTP to email for registration verification
     */
    @Transactional
    public OTPResponse sendOTPForRegistration(String email) {
        try {
            // Delete existing OTP if present
            otpRepository.deleteByEmail(email);

            // Generate new OTP
            String otpCode = generateOTP();
            LocalDateTime expiresAt = LocalDateTime.now().plusSeconds(otpExpirySeconds);

            // Save OTP to database
            OTP otp = OTP.builder()
                    .email(email)
                    .code(otpCode)
                    .expiresAt(expiresAt)
                    .isVerified(false)
                    .attempts(0)
                    .createdAt(LocalDateTime.now())
                    .build();

            otpRepository.save(otp);

            // Send OTP via email
            emailService.sendOTP(email, otpCode);

            log.info("OTP sent successfully for registration to: {}", email);
            return OTPResponse.builder()
                    .success(true)
                    .message("OTP sent to your email address")
                    .expiresAt(expiresAt)
                    .isVerified(false)
                    .build();
        } catch (Exception e) {
            log.error("Error sending OTP for registration to: {}", email, e);
            return OTPResponse.builder()
                    .success(false)
                    .message("Failed to send OTP. Please try again.")
                    .build();
        }
    }

    /**
     * Sends OTP to email for password reset
     */
    @Transactional
    public OTPResponse sendOTPForPasswordReset(String email) {
        try {
            // Delete existing OTP if present
            otpRepository.deleteByEmail(email);

            // Generate new OTP
            String otpCode = generateOTP();
            LocalDateTime expiresAt = LocalDateTime.now().plusSeconds(otpExpirySeconds);

            // Save OTP to database
            OTP otp = OTP.builder()
                    .email(email)
                    .code(otpCode)
                    .expiresAt(expiresAt)
                    .isVerified(false)
                    .attempts(0)
                    .createdAt(LocalDateTime.now())
                    .build();

            otpRepository.save(otp);

            // Send OTP via email
            emailService.sendPasswordResetOTP(email, otpCode);

            log.info("OTP sent successfully for password reset to: {}", email);
            return OTPResponse.builder()
                    .success(true)
                    .message("OTP sent to your email address")
                    .expiresAt(expiresAt)
                    .isVerified(false)
                    .build();
        } catch (Exception e) {
            log.error("Error sending OTP for password reset to: {}", email, e);
            return OTPResponse.builder()
                    .success(false)
                    .message("Failed to send OTP. Please try again.")
                    .build();
        }
    }

    /**
     * Verifies OTP code
     */
    @Transactional
    public OTPResponse verifyOTP(String email, String code) {
        try {
            // Find OTP record
            OTP otp = otpRepository.findByEmailAndExpiresAtAfter(email, LocalDateTime.now())
                    .orElse(null);

            if (otp == null) {
                log.warn("OTP not found or expired for email: {}", email);
                return OTPResponse.builder()
                        .success(false)
                        .message("OTP has expired or not found. Please request a new OTP.")
                        .isVerified(false)
                        .build();
            }

            // Check max attempts
            if (otp.getAttempts() >= maxAttempts) {
                log.warn("Max OTP attempts exceeded for email: {}", email);
                otpRepository.deleteByEmail(email);
                return OTPResponse.builder()
                        .success(false)
                        .message("Maximum OTP attempts exceeded. Please request a new OTP.")
                        .isVerified(false)
                        .build();
            }

            // Verify OTP code
            if (!otp.getCode().equals(code)) {
                otp.setAttempts(otp.getAttempts() + 1);
                otpRepository.save(otp);
                log.warn("Invalid OTP code for email: {}", email);
                return OTPResponse.builder()
                        .success(false)
                        .message("Invalid OTP code. Please try again.")
                        .isVerified(false)
                        .build();
            }

            // Mark OTP as verified
            otp.setIsVerified(true);
            otp.setVerifiedAt(LocalDateTime.now());
            otpRepository.save(otp);

            log.info("OTP verified successfully for email: {}", email);
            return OTPResponse.builder()
                    .success(true)
                    .message("Email verified successfully")
                    .isVerified(true)
                    .build();
        } catch (Exception e) {
            log.error("Error verifying OTP for email: {}", email, e);
            return OTPResponse.builder()
                    .success(false)
                    .message("Error verifying OTP. Please try again.")
                    .isVerified(false)
                    .build();
        }
    }

    /**
     * Resends OTP to email
     */
    @Transactional
    public OTPResponse resendOTP(String email) {
        try {
            // Delete existing OTP
            otpRepository.deleteByEmail(email);

            // Generate and send new OTP
            return sendOTPForRegistration(email);
        } catch (Exception e) {
            log.error("Error resending OTP to: {}", email, e);
            return OTPResponse.builder()
                    .success(false)
                    .message("Failed to resend OTP. Please try again.")
                    .build();
        }
    }

    /**
     * Checks if OTP is expired
     */
    public boolean isOTPExpired(String email) {
        return otpRepository.findByEmailAndExpiresAtAfter(email, LocalDateTime.now()).isEmpty();
    }

    /**
     * Marks OTP as verified (used after successful email verification)
     */
    @Transactional
    public void markOTPVerified(String email) {
        OTP otp = otpRepository.findByEmail(email).orElse(null);
        if (otp != null) {
            otp.setIsVerified(true);
            otp.setVerifiedAt(LocalDateTime.now());
            otpRepository.save(otp);
        }
    }

    /**
     * Clears OTP for email (used after successful registration or password reset)
     */
    @Transactional
    public void clearOTP(String email) {
        otpRepository.deleteByEmail(email);
    }
}
