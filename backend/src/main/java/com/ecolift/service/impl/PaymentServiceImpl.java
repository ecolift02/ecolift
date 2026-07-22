package com.ecolift.service.impl;

import com.ecolift.entity.Booking;
import com.ecolift.entity.Payment;
import com.ecolift.exception.InvalidRideStateException;
import com.ecolift.exception.PaymentFailedException;
import com.ecolift.exception.ResourceNotFoundException;
import com.ecolift.repository.PaymentRepository;
import com.ecolift.service.BookingService;
import com.ecolift.service.PaymentService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@Transactional
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final BookingService bookingService;

    public PaymentServiceImpl(PaymentRepository paymentRepository, BookingService bookingService) {
        this.paymentRepository = paymentRepository;
        this.bookingService = bookingService;
    }

    @Override
    public Payment save(Payment payment) {
        return paymentRepository.save(payment);
    }

    @Override
    public Payment update(Long id, Payment paymentDetails) {
        Payment payment = findById(id);
        // Assuming paymentDetails.getAmount() returns a BigDecimal
        payment.setAmount(paymentDetails.getAmount());
        return paymentRepository.save(payment);
    }

    @Override
    public void delete(Long id) {
        Payment payment = findById(id);
        paymentRepository.delete(payment);
    }

    @Override
    @Transactional(readOnly = true)
    public Payment findById(Long id) {
        return paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with id: " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<Payment> findAll() {
        return paymentRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public boolean exists(Long id) {
        return paymentRepository.existsById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public long count() {
        return paymentRepository.count();
    }

    @Override
    public Payment initiatePayment(Long bookingId, String paymentMethod) {
        Booking booking = bookingService.findById(bookingId);

        // FIXED: Using Enum instead of String
        if (paymentRepository.existsByBookingIdAndStatus(bookingId, Payment.PaymentStatus.COMPLETED)) {
            throw new InvalidRideStateException("Payment for this booking is already completed.");
        }

        Payment payment = new Payment();
        payment.setBooking(booking);
        
        // FIXED: Convert Double to BigDecimal
        payment.setAmount(BigDecimal.valueOf(bookingService.calculateTotalFare(bookingId)));
        
        // Assuming your entity has a string paymentMethod. 
        // If it's an enum or doesn't exist, adjust accordingly.
        payment.setPaymentMethod(paymentMethod); 
        
        // FIXED: Using Enum instead of String
        payment.setStatus(Payment.PaymentStatus.PENDING);
        
        return paymentRepository.save(payment);
    }

    @Override
    public Payment markPaymentSuccessful(Long paymentId, String transactionId) {
        Payment payment = findById(paymentId);
        // FIXED: Using Enum instead of String
        payment.setStatus(Payment.PaymentStatus.COMPLETED);
        
        // FIXED: Removed undefined method. 
        // If your entity has a 'paymentReference' or similar, uncomment and use that:
        // payment.setPaymentReference(transactionId); 
        
        return paymentRepository.save(payment);
    }

    @Override
    public Payment markPaymentFailed(Long paymentId) {
        Payment payment = findById(paymentId);
        // FIXED: Using Enum instead of String
        payment.setStatus(Payment.PaymentStatus.FAILED);
        paymentRepository.save(payment);
        throw new PaymentFailedException("Payment failed for ID: " + paymentId);
    }

    @Override
    public Payment refundPayment(Long paymentId) {
        Payment payment = findById(paymentId);
        // FIXED: Using Enum instead of String
        if (!Payment.PaymentStatus.COMPLETED.equals(payment.getStatus())) {
            throw new InvalidRideStateException("Cannot refund an incomplete payment.");
        }
        // FIXED: Using Enum instead of String
        payment.setStatus(Payment.PaymentStatus.REFUNDED);
        return paymentRepository.save(payment);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Payment> getPaymentHistory(Long passengerId) {
        return paymentRepository.findByBookingPassengerId(passengerId);
    }
}