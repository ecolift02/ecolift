package com.ecolift.service.impl;

import com.ecolift.entity.Booking;
import com.ecolift.entity.Ride;
import com.ecolift.entity.User;
import com.ecolift.exception.DuplicateResourceException;
import com.ecolift.exception.InvalidRideStateException;
import com.ecolift.exception.ResourceNotFoundException;
import com.ecolift.repository.BookingRepository;
import com.ecolift.service.BookingService;
import com.ecolift.service.RideService;
import com.ecolift.service.UserService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final RideService rideService;
    private final UserService userService;

    public BookingServiceImpl(BookingRepository bookingRepository, RideService rideService, UserService userService) {
        this.bookingRepository = bookingRepository;
        this.rideService = rideService;
        this.userService = userService;
    }

    @Override
    public Booking save(Booking booking) {
        return bookingRepository.save(booking);
    }

    @Override
    public Booking update(Long id, Booking bookingDetails) {
        Booking booking = findById(id);
        booking.setStatus(bookingDetails.getStatus());
        return bookingRepository.save(booking);
    }

    @Override
    public void delete(Long id) {
        Booking booking = findById(id);
        bookingRepository.delete(booking);
    }

    @Override
    @Transactional(readOnly = true)
    public Booking findById(Long id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<Booking> findAll() {
        return bookingRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public boolean exists(Long id) {
        return bookingRepository.existsById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public long count() {
        return bookingRepository.count();
    }

    @Override
    public Booking createBooking(Long rideId, Long passengerId, int requestedSeats) {
        Ride ride = rideService.findById(rideId);
        User passenger = userService.getPassengerProfile(passengerId);

        // Validation 1: Check if the ride was deleted/cancelled
        if (Boolean.TRUE.equals(ride.getIsDeleted())) {
            throw new InvalidRideStateException("Cannot book a ride that has been cancelled.");
        }
        
        // Validation 2: Check if the ride has already departed
        if (ride.getDepartureTime() != null && ride.getDepartureTime().isBefore(LocalDateTime.now())) {
            throw new InvalidRideStateException("Cannot book a ride that has already departed.");
        }

        if (bookingRepository.existsByRideIdAndPassengerId(rideId, passengerId)) {
            throw new DuplicateResourceException("You have already booked this ride.");
        }

        // Deduct seats transactionally
        rideService.updateAvailableSeats(rideId, requestedSeats);

        Booking booking = new Booking();
        booking.setBookingReference(UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        booking.setRide(ride);
        booking.setPassenger(passenger);
        booking.setSeatsBooked(requestedSeats);
        booking.setStatus(Booking.BookingStatus.PENDING);
        
        // Use BigDecimal for accurate financial calculation based on pricePerSeat
        BigDecimal total = ride.getPricePerSeat().multiply(BigDecimal.valueOf(requestedSeats));
        booking.setTotalPrice(total);

        return bookingRepository.save(booking);
    }

    @Override
    public void cancelBooking(Long bookingId) {
        Booking booking = findById(bookingId);
        if (Booking.BookingStatus.CANCELLED.equals(booking.getStatus())) {
            throw new InvalidRideStateException("Booking is already cancelled.");
        }
        
        // Restore seats
        rideService.updateAvailableSeats(booking.getRide().getId(), -booking.getSeatsBooked());
        
        booking.setStatus(Booking.BookingStatus.CANCELLED);
        booking.setCancellationTime(LocalDateTime.now());
        booking.setCancellationReason("Cancelled by user");
        bookingRepository.save(booking);
    }

    @Override
    public void approveBooking(Long bookingId) {
        Booking booking = findById(bookingId);
        booking.setStatus(Booking.BookingStatus.CONFIRMED);
        bookingRepository.save(booking);
    }

    @Override
    public void rejectBooking(Long bookingId) {
        Booking booking = findById(bookingId);
        
        // Restore seats
        rideService.updateAvailableSeats(booking.getRide().getId(), -booking.getSeatsBooked());
        
        booking.setStatus(Booking.BookingStatus.REJECTED);
        bookingRepository.save(booking);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Booking> getBookingsByPassenger(Long passengerId) {
        return bookingRepository.findByPassengerId(passengerId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Booking> getBookingsByRide(Long rideId) {
        return bookingRepository.findByRideId(rideId);
    }

    @Override
    @Transactional(readOnly = true)
    public Double calculateTotalFare(Long bookingId) {
        Booking booking = findById(bookingId);
        return booking.getTotalPrice().doubleValue();
    }
}