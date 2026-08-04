package com.ecolift.exception;

import com.ecolift.dto.response.ErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.MailException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    /**
     * Handles @Valid failures from DTOs (e.g., empty email, negative price).
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationExceptions(
            MethodArgumentNotValidException ex, 
            HttpServletRequest request
    ) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });

        ErrorResponse errorResponse = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.BAD_REQUEST.value())
                .error("Validation Error")
                .message("Request payload failed validation checks")
                .path(request.getRequestURI())
                .validationErrors(errors)
                .build();

        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    /**
     * Handles business logic validation (e.g., "Cannot offer more seats than capacity").
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgumentException(
            IllegalArgumentException ex, 
            HttpServletRequest request
    ) {
        return buildErrorResponse(ex, HttpStatus.BAD_REQUEST, request);
    }

    /**
     * Handles state conflicts (e.g., "Ride is no longer available").
     */
    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ErrorResponse> handleIllegalStateException(
            IllegalStateException ex, 
            HttpServletRequest request
    ) {
        return buildErrorResponse(ex, HttpStatus.CONFLICT, request);
    }

    /**
     * Handles "not found" lookups (e.g., driver, vehicle, location, ride not found).
     */
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleResourceNotFoundException(
            ResourceNotFoundException ex,
            HttpServletRequest request
    ) {
        return buildErrorResponse(ex, HttpStatus.NOT_FOUND, request);
    }

    /**
     * Handles duplicate data conflicts (e.g., license plate/registration number already exists).
     */
    @ExceptionHandler(DuplicateResourceException.class)
    public ResponseEntity<ErrorResponse> handleDuplicateResourceException(
            DuplicateResourceException ex,
            HttpServletRequest request
    ) {
        return buildErrorResponse(ex, HttpStatus.CONFLICT, request);
    }

    /**
     * Handles invalid ride state transitions (e.g., vehicle doesn't belong to driver,
     * ride already cancelled).
     */
    @ExceptionHandler(InvalidRideStateException.class)
    public ResponseEntity<ErrorResponse> handleInvalidRideStateException(
            InvalidRideStateException ex,
            HttpServletRequest request
    ) {
        return buildErrorResponse(ex, HttpStatus.CONFLICT, request);
    }

    /**
     * Handles attempts to publish a ride with an unverified vehicle.
     */
    @ExceptionHandler(VehicleNotVerifiedException.class)
    public ResponseEntity<ErrorResponse> handleVehicleNotVerifiedException(
            VehicleNotVerifiedException ex,
            HttpServletRequest request
    ) {
        return buildErrorResponse(ex, HttpStatus.FORBIDDEN, request);
    }

    /**
     * Handles seat availability conflicts on booking.
     */
    @ExceptionHandler(SeatUnavailableException.class)
    public ResponseEntity<ErrorResponse> handleSeatUnavailableException(
            SeatUnavailableException ex,
            HttpServletRequest request
    ) {
        return buildErrorResponse(ex, HttpStatus.CONFLICT, request);
    }

    /**
     * Handles actions performed by a user without the right permissions on a resource
     * (distinct from Spring Security's own AccessDeniedException).
     */
    @ExceptionHandler(UnauthorizedActionException.class)
    public ResponseEntity<ErrorResponse> handleUnauthorizedActionException(
            UnauthorizedActionException ex,
            HttpServletRequest request
    ) {
        return buildErrorResponse(ex, HttpStatus.FORBIDDEN, request);
    }

    /**
     * Handles payment processing failures.
     */
    @ExceptionHandler(PaymentFailedException.class)
    public ResponseEntity<ErrorResponse> handlePaymentFailedException(
            PaymentFailedException ex,
            HttpServletRequest request
    ) {
        return buildErrorResponse(ex, HttpStatus.PAYMENT_REQUIRED, request);
    }

    /**
     * Handles invalid/expired/already-used OTP codes (register verification
     * and forgot-password flows).
     */
    @ExceptionHandler(InvalidOtpException.class)
    public ResponseEntity<ErrorResponse> handleInvalidOtpException(
            InvalidOtpException ex,
            HttpServletRequest request
    ) {
        return buildErrorResponse(ex, HttpStatus.BAD_REQUEST, request);
    }

    /**
     * Handles login attempts before the user has confirmed their email OTP.
     */
    @ExceptionHandler(EmailNotVerifiedException.class)
    public ResponseEntity<ErrorResponse> handleEmailNotVerifiedException(
            EmailNotVerifiedException ex,
            HttpServletRequest request
    ) {
        return buildErrorResponse(ex, HttpStatus.FORBIDDEN, request);
    }

    @ExceptionHandler(DuplicateEmailException.class)
    public ResponseEntity<ErrorResponse> handleDuplicateEmailException(
            DuplicateEmailException ex,
            HttpServletRequest request
    ) {
        return buildErrorResponse(ex, HttpStatus.CONFLICT, request);
    }

    @ExceptionHandler(EmailNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleEmailNotFoundException(
            EmailNotFoundException ex,
            HttpServletRequest request
    ) {
        return buildErrorResponse(ex, HttpStatus.NOT_FOUND, request);
    }

    @ExceptionHandler(EmailAlreadyVerifiedException.class)
    public ResponseEntity<ErrorResponse> handleEmailAlreadyVerifiedException(
            EmailAlreadyVerifiedException ex,
            HttpServletRequest request
    ) {
        return buildErrorResponse(ex, HttpStatus.CONFLICT, request);
    }

    @ExceptionHandler(OtpExpiredException.class)
    public ResponseEntity<ErrorResponse> handleOtpExpiredException(
            OtpExpiredException ex,
            HttpServletRequest request
    ) {
        return buildErrorResponse(ex, HttpStatus.BAD_REQUEST, request);
    }

    @ExceptionHandler(OtpAlreadyUsedException.class)
    public ResponseEntity<ErrorResponse> handleOtpAlreadyUsedException(
            OtpAlreadyUsedException ex,
            HttpServletRequest request
    ) {
        return buildErrorResponse(ex, HttpStatus.BAD_REQUEST, request);
    }

    @ExceptionHandler(TooManyOtpAttemptsException.class)
    public ResponseEntity<ErrorResponse> handleTooManyOtpAttemptsException(
            TooManyOtpAttemptsException ex,
            HttpServletRequest request
    ) {
        return buildErrorResponse(ex, HttpStatus.TOO_MANY_REQUESTS, request);
    }

    @ExceptionHandler(EmailSendingFailedException.class)
    public ResponseEntity<ErrorResponse> handleEmailSendingFailedException(
            EmailSendingFailedException ex,
            HttpServletRequest request
    ) {
        log.error("Email send failed: {}", ex.getMessage(), ex);
        return buildErrorResponse(ex, HttpStatus.SERVICE_UNAVAILABLE, request);
    }

    /**
     * Handles SMTP/email delivery failures distinctly from the generic
     * fallback, so misconfigured mail credentials show a clear, actionable
     * message instead of "please contact support".
     */
    @ExceptionHandler(EmailSendException.class)
    public ResponseEntity<ErrorResponse> handleEmailSendException(
            EmailSendException ex,
            HttpServletRequest request
    ) {
        return buildErrorResponse(ex, HttpStatus.SERVICE_UNAVAILABLE, request);
    }

    /**
     * Handles invalid/unsupported uploaded files (wrong type, too large) -
     * used by the profile picture upload endpoint.
     */
    @ExceptionHandler(InvalidFileException.class)
    public ResponseEntity<ErrorResponse> handleInvalidFileException(
            InvalidFileException ex,
            HttpServletRequest request
    ) {
        return buildErrorResponse(ex, HttpStatus.BAD_REQUEST, request);
    }

    /**
     * Handles RBAC Security failures (@PreAuthorize rejections).
     */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDeniedException(
            AccessDeniedException ex, 
            HttpServletRequest request
    ) {
        ErrorResponse errorResponse = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.FORBIDDEN.value())
                .error("Forbidden")
                .message("You do not have the required permissions to execute this action.")
                .path(request.getRequestURI())
                .build();

        return new ResponseEntity<>(errorResponse, HttpStatus.FORBIDDEN);
    }

    /**
     * Thrown by EmailServiceImpl when SMTP send fails (bad credentials, network,
     * etc). Surfaced separately from the generic handler so registration/OTP
     * failures are debuggable instead of showing a vague "contact support".
     */
    @ExceptionHandler(MailException.class)
    public ResponseEntity<ErrorResponse> handleMailException(
            MailException ex,
            HttpServletRequest request
    ) {
        log.error("Email send failed: {}", ex.getMessage(), ex);
        return buildErrorResponse(
                new RuntimeException("We couldn't send the verification email right now. "
                        + "Please check the SMTP configuration or try again shortly."),
                HttpStatus.SERVICE_UNAVAILABLE,
                request);
    }

    /**
     * Fallback for all other unhandled exceptions.
     * Prevents raw stack traces from leaking to the frontend.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGlobalException(
            Exception ex, 
            HttpServletRequest request
    ) {
        log.error("Unhandled exception on {}: {}", request.getRequestURI(), ex.getMessage(), ex);

        ErrorResponse errorResponse = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                .error("Internal Server Error")
                .message("An unexpected error occurred. Please contact support.")
                .path(request.getRequestURI())
                .build();

        return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    private ResponseEntity<ErrorResponse> buildErrorResponse(
            Exception ex, 
            HttpStatus status, 
            HttpServletRequest request
    ) {
        ErrorResponse errorResponse = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(status.value())
                .error(status.getReasonPhrase())
                .message(ex.getMessage()) // Relies on you writing clear exception messages in the Service layer
                .path(request.getRequestURI())
                .build();

        return new ResponseEntity<>(errorResponse, status);
    }
}