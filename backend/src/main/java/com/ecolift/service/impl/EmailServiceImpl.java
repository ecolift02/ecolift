package com.ecolift.service.impl;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import com.ecolift.exception.EmailSendException;
import com.ecolift.service.EmailService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${application.resend.api-key}")
    private String resendApiKey;

    @Value("${application.resend.from-address}")
    private String fromAddress;

    @Value("${application.security.otp.expiration-minutes:10}")
    private int otpExpirationMinutes;

    private static final String RESEND_API_URL = "https://api.resend.com/emails";

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
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(resendApiKey);

            Map<String, Object> payload = new HashMap<>();
            payload.put("from", fromAddress);
            payload.put("to", List.of(toEmail));
            payload.put("subject", subject);
            payload.put("html", htmlBody);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);

            ResponseEntity<String> response = restTemplate.postForEntity(RESEND_API_URL, entity, String.class);

            HttpStatusCode status = response.getStatusCode();
            if (!status.is2xxSuccessful()) {
                log.error("Resend API returned non-success status {} for {}: {}", status, toEmail, response.getBody());
                throw new EmailSendException(
                        "We couldn't send the verification email right now. Please try again shortly.",
                        null);
            }
        } catch (RestClientException ex) {
            log.error("Failed to send email via Resend to {}: {}", toEmail, ex.getMessage(), ex);
            throw new EmailSendException(
                    "We couldn't send the verification email right now. Please try again shortly.",
                    ex);
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
