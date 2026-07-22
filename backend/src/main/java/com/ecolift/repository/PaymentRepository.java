package com.ecolift.repository;

import com.ecolift.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    
    // Updated to expect Payment.PaymentStatus instead of String
    boolean existsByBookingIdAndStatus(Long bookingId, Payment.PaymentStatus status);
    
    List<Payment> findByBookingPassengerId(Long passengerId);
}