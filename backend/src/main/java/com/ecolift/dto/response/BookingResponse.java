package com.ecolift.dto.response;

import com.ecolift.entity.Booking;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class BookingResponse {
    private Long id;
    private String bookingReference;

    // Ride summary (enough for a booking list/card without a second API call)
    private Long rideId;
    private String driverName;
    private String departureLocationName;
    private String arrivalLocationName;
    private LocalDateTime departureTime;

    // Passenger summary (relevant on the driver's "pending requests" view)
    private Long passengerId;
    private String passengerName;

    private Integer seatsBooked;
    private BigDecimal totalPrice;
    private Booking.BookingStatus status;
    private String cancellationReason;
    private LocalDateTime cancellationTime;
    private String driverPhoneNumber;
    private String passengerPhoneNumber;
}