package com.ecolift.service.impl;

import com.ecolift.entity.OtpPurpose;
import com.ecolift.entity.OtpToken;
import com.ecolift.exception.OtpExpiredException;
import com.ecolift.repository.OtpTokenRepository;
import com.ecolift.service.EmailService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OtpServiceImplTest {

    @Mock
    private OtpTokenRepository otpTokenRepository;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private OtpServiceImpl otpService;

    @Test
    void verifyOtpThrowsOtpExpiredExceptionWhenTokenIsExpired() {
        ReflectionTestUtils.setField(otpService, "otpExpirationMinutes", 10);

        OtpToken expiredToken = OtpToken.builder()
                .email("user@example.com")
                .otpCode("123456")
                .purpose(OtpPurpose.REGISTER)
                .expiresAt(LocalDateTime.now().minusMinutes(1))
                .used(false)
                .attemptCount(0)
                .build();

        when(otpTokenRepository.findTopByEmailAndPurposeAndUsedFalseOrderByCreatedAtDesc(
                eq("user@example.com"), eq(OtpPurpose.REGISTER)))
                .thenReturn(Optional.of(expiredToken));

        assertThrows(OtpExpiredException.class,
                () -> otpService.verifyOtp("user@example.com", "123456", OtpPurpose.REGISTER));
    }
}
