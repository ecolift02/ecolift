package com.ecolift.service;

import com.ecolift.entity.Payment;
import java.util.List;

public interface PaymentService {
    Payment save(Payment payment);
    Payment update(Long id, Payment payment);
    void delete(Long id);
    Payment findById(Long id);
    List<Payment> findAll();
    boolean exists(Long id);
    long count();

    Payment initiatePayment(Long bookingId, String paymentMethod);
    Payment markPaymentSuccessful(Long paymentId, String transactionId);
    Payment markPaymentFailed(Long paymentId);
    Payment refundPayment(Long paymentId);
    List<Payment> getPaymentHistory(Long passengerId);
}