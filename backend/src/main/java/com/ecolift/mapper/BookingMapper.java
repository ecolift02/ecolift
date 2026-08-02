package com.ecolift.mapper;

import com.ecolift.dto.response.BookingResponse;
import com.ecolift.entity.Booking;

public class BookingMapper {

    public static BookingResponse toResponse(Booking booking) {
        return BookingResponse.builder()
                .id(booking.getId())
                .bookingReference(booking.getBookingReference())
                .rideId(booking.getRide() != null ? booking.getRide().getId() : null)
                .driverName(booking.getRide() != null && booking.getRide().getDriver() != null
                        ? booking.getRide().getDriver().getName() : "Unknown")
                .departureLocationName(booking.getRide() != null && booking.getRide().getRoute().getDepartureLocationName() != null
                        ? booking.getRide().getRoute().getDepartureLocationName() : "Unknown")
                .arrivalLocationName(booking.getRide() != null && booking.getRide().getRoute().getArrivalLocationName() != null
                        ? booking.getRide().getRoute().getArrivalLocationName() : "Unknown")
                .departureTime(booking.getRide() != null ? booking.getRide().getDepartureTime() : null)
                .passengerId(booking.getPassenger() != null ? booking.getPassenger().getId() : null)
                .passengerName(booking.getPassenger() != null ? booking.getPassenger().getName() : "Unknown")
                .seatsBooked(booking.getSeatsBooked())
                .totalPrice(booking.getTotalPrice())
                .status(booking.getStatus())
                .cancellationReason(booking.getCancellationReason())
                .cancellationTime(booking.getCancellationTime())
                .driverPhoneNumber(booking.getRide() != null && booking.getRide().getDriver() != null
                        ? booking.getRide().getDriver().getPhone() : "NA")
                .passengerPhoneNumber(booking.getPassenger()!=null?booking.getPassenger().getPhone():"NA")
                .build();
    }
}