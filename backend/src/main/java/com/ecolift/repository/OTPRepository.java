package com.ecolift.repository;

import com.ecolift.entity.OTP;
import java.time.LocalDateTime;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OTPRepository extends JpaRepository<OTP, Long> {

    Optional<OTP> findByEmail(String email);

    Optional<OTP> findByEmailAndExpiresAtAfter(String email, LocalDateTime now);

    void deleteByEmail(String email);

    Optional<OTP> findTopByEmailAndIsVerifiedFalseOrderByCreatedAtDesc(String email);

    Optional<OTP> findTopByEmailOrderByCreatedAtDesc(String email);
}