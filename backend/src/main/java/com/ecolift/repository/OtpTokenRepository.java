package com.ecolift.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ecolift.entity.OtpPurpose;
import com.ecolift.entity.OtpToken;

public interface OtpTokenRepository extends JpaRepository<OtpToken, Long> {

    // Most recent, still-unused OTP for a given email + purpose. Used to
    // validate the code the user typed in.
    Optional<OtpToken> findTopByEmailAndPurposeAndUsedFalseOrderByCreatedAtDesc(
            String email, OtpPurpose purpose);
}
