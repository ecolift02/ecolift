package com.ecolift.service.impl;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.MailSendException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import com.ecolift.service.EmailService;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromAddress;

    @Value("${application.security.otp.expiration-minutes:10}")
    private int otpExpirationMinutes;

    @Override
    public void sendRegistrationOtp(String toEmail, String name, String otp) {
        String subject = "Verify your EcoLift account";
        String body = buildOtpEmailBody(name, otp,
                "Welcome to EcoLift! Use the code below to verify your email address and activate your account.");
        send(toEmail, subject, body);
    }

    @Override
    public void sendPasswordResetOtp(String toEmail, String name, String otp) {
        String subject = "Reset your EcoLift password";
        String body = buildOtpEmailBody(name, otp,
                "We received a request to reset your EcoLift password. Use the code below to continue. "
                        + "If you didn't request this, you can safely ignore this email.");
        send(toEmail, subject, body);
    }

    private void send(String toEmail, String subject, String htmlBody) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, "UTF-8");
            helper.setFrom(fromAddress);
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            mailSender.send(message);
        } catch (MessagingException ex) {
            log.error("Failed to send email to {}: {}", toEmail, ex.getMessage(), ex);
            throw new MailSendException("Failed to send email. Please try again later.", ex);
        } catch (MailException ex) {
            log.error("Failed to send email to {}: {}", toEmail, ex.getMessage(), ex);
            throw ex;
        }
    }

    private String buildOtpEmailBody(String name, String otp, String intro) {
        return "<div style='font-family:Arial,sans-serif;max-width:480px;margin:auto'>"
                + "<h2 style='color:#15803d'>EcoLift</h2>"
                + "<p>Hi " + name + ",</p>"
                + "<p>" + intro + "</p>"
                + "<p style='font-size:32px;font-weight:bold;letter-spacing:6px;"
                + "background:#f0fdf4;color:#15803d;padding:16px;text-align:center;border-radius:8px'>"
                + otp + "</p>"
                + "<p>This code expires in " + otpExpirationMinutes + " minutes. Do not share it with anyone.</p>"
                + "<p style='color:#888;font-size:12px'>If you didn't request this, please ignore this email.</p>"
                + "</div>";
    }
}
