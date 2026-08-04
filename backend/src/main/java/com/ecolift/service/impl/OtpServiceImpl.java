package com.ecolift.service.impl;

import java.security.SecureRandom;
import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ecolift.entity.OtpPurpose;
import com.ecolift.entity.OtpToken;
import com.ecolift.exception.InvalidOtpException;
import com.ecolift.repository.OtpTokenRepository;
import com.ecolift.service.EmailService;
import com.ecolift.service.OtpService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class OtpServiceImpl implements OtpService {

    private static final int MAX_ATTEMPTS = 5;
    private static final SecureRandom RANDOM = new SecureRandom();

    private final OtpTokenRepository otpTokenRepository;
    private final EmailService emailService;

    @Value("${application.security.otp.expiration-minutes:10}")
    private int otpExpirationMinutes;

    @Override
    @Transactional
    public void generateAndSendOtp(String email, String name, OtpPurpose purpose) {
        // Invalidate any previous unused OTP for this email+purpose so only
        // the most recently issued code can ever be redeemed.
        otpTokenRepository.findTopByEmailAndPurposeAndUsedFalseOrderByCreatedAtDesc(email, purpose)
                .ifPresent(old -> {
                    old.setUsed(true);
                    otpTokenRepository.save(old);
                });

        String code = String.format("%06d", RANDOM.nextInt(1_000_000));

        OtpToken token = OtpToken.builder()
                .email(email)
                .otpCode(code)
                .purpose(purpose)
                .expiresAt(LocalDateTime.now().plusMinutes(otpExpirationMinutes))
                .used(false)
                .attemptCount(0)
                .build();

        otpTokenRepository.save(token);

        if (purpose == OtpPurpose.REGISTER) {
            emailService.sendRegistrationOtp(email, name, code);
        } else {
            emailService.sendPasswordResetOtp(email, name, code);
        }
    }

    @Override
    @Transactional
    public void verifyOtp(String email, String otp, OtpPurpose purpose) {
        OtpToken token = otpTokenRepository
                .findTopByEmailAndPurposeAndUsedFalseOrderByCreatedAtDesc(email, purpose)
                .orElseThrow(() -> new InvalidOtpException(
                        "No active OTP found for this email. Please request a new one."));

        if (token.getAttemptCount() >= MAX_ATTEMPTS) {
            throw new InvalidOtpException("Too many incorrect attempts. Please request a new OTP.");
        }

        if (token.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new InvalidOtpException("This OTP has expired. Please request a new one.");
        }

        if (!token.getOtpCode().equals(otp)) {
            token.setAttemptCount(token.getAttemptCount() + 1);
            otpTokenRepository.save(token);
            throw new InvalidOtpException("Incorrect OTP. Please try again.");
        }

        token.setUsed(true);
        otpTokenRepository.save(token);
    }
}
