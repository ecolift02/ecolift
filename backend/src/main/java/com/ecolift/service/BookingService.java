package com.ecolift.service;

import com.ecolift.entity.Booking;
import java.util.List;

public interface BookingService {
    Booking save(Booking booking);
    Booking update(Long id, Booking booking);
    void delete(Long id);
    Booking findById(Long id);
    List<Booking> findAll();
    boolean exists(Long id);
    long count();

    Booking createBooking(Long rideId, Long passengerId, int requestedSeats);
    void cancelBooking(Long bookingId);
    void approveBooking(Long bookingId);
    void rejectBooking(Long bookingId);
    List<Booking> getBookingsByPassenger(Long passengerId);
    List<Booking> getBookingsByRide(Long rideId);
    Double calculateTotalFare(Long bookingId);
}