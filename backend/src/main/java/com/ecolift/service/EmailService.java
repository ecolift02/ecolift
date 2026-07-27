package com.ecolift.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String senderEmail;

    /**
     * Sends OTP email for registration verification
     */
    public void sendOTP(String recipientEmail, String otp) {
        try {
            log.info("Sending OTP email to: {}", recipientEmail);

            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(senderEmail);
            message.setTo(recipientEmail);
            message.setSubject("EcoLift - Email Verification Code");
            message.setText(
                "Welcome to EcoLift!\n\n"
                    + "Your email verification code is: " + otp + "\n\n"
                    + "This code will expire in 5 minutes.\n\n"
                    + "If you did not request this code, please ignore this email.\n\n"
                    + "Thank you,\n"
                    + "EcoLift Team"
            );

            mailSender.send(message);
            log.info("OTP email sent successfully to: {}", recipientEmail);
        } catch (Exception e) {
            log.error("Failed to send OTP email to: {}", recipientEmail, e);
            throw new RuntimeException("Failed to send OTP email: " + e.getMessage(), e);
        }
    }

    /**
     * Sends OTP email for password reset
     */
    public void sendPasswordResetOTP(String recipientEmail, String otp) {
        try {
            log.info("Sending password reset OTP email to: {}", recipientEmail);

            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(senderEmail);
            message.setTo(recipientEmail);
            message.setSubject("EcoLift - Password Reset Code");
            message.setText(
                "Hello,\n\n"
                    + "You requested to reset your password.\n"
                    + "Your password reset code is: " + otp + "\n\n"
                    + "This code will expire in 5 minutes.\n\n"
                    + "If you did not request this, please ignore this email.\n\n"
                    + "Thank you,\n"
                    + "EcoLift Team"
            );

            mailSender.send(message);
            log.info("Password reset OTP email sent successfully to: {}", recipientEmail);
        } catch (Exception e) {
            log.error("Failed to send password reset OTP email to: {}", recipientEmail, e);
            throw new RuntimeException("Failed to send password reset OTP email: " + e.getMessage(), e);
        }
    }
}
