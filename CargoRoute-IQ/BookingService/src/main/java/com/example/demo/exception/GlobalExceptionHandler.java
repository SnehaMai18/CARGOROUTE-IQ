package com.example.demo.exception;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.servlet.NoHandlerFoundException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import com.example.demo.entity.enums.BookingStatus;
import com.example.demo.entity.enums.ShipperStatus;

@ControllerAdvice
public class GlobalExceptionHandler {

    private static final String VALID_BOOKING_STATUSES = Arrays.stream(BookingStatus.values())
            .map(Enum::name)
            .collect(Collectors.joining(", "));

    private static final String VALID_SHIPPER_STATUSES = Arrays.stream(ShipperStatus.values())
            .map(Enum::name)
            .collect(Collectors.joining(", "));

    // Handles invalid enum value in JSON request body (e.g. POST /addBooking with unknown status)
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, Object>> handleUnreadableMessage(HttpMessageNotReadableException ex) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", HttpStatus.BAD_REQUEST.value());
        body.put("error", "Bad Request");

        String cause = ex.getCause() != null ? ex.getCause().getMessage() : ex.getMessage();
        if (cause != null && cause.contains("BookingStatus")) {
            body.put("message", "Invalid booking status. Valid values are: " + VALID_BOOKING_STATUSES);
        } else if (cause != null && cause.contains("ShipperStatus")) {
            body.put("message", "Invalid shipper status. Valid values are: " + VALID_SHIPPER_STATUSES);
        } else {
            body.put("message", "Malformed JSON request: " + ex.getMessage());
        }
        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }

    // Handles invalid enum value in path variables / request params
    // (e.g. PATCH /updateBookingStatus/{id}?status=INVALID or GET /getBookingsByStatus/INVALID)
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<Map<String, Object>> handleTypeMismatch(MethodArgumentTypeMismatchException ex) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", HttpStatus.BAD_REQUEST.value());
        body.put("error", "Bad Request");

        if (ex.getRequiredType() != null && ex.getRequiredType().equals(BookingStatus.class)) {
            body.put("message", "Invalid booking status '" + ex.getValue()
                    + "'. Valid values are: " + VALID_BOOKING_STATUSES);
        } else if (ex.getRequiredType() != null && ex.getRequiredType().equals(ShipperStatus.class)) {
            body.put("message", "Invalid shipper status '" + ex.getValue()
                    + "'. Valid values are: " + VALID_SHIPPER_STATUSES);
        } else {
            body.put("message", "Invalid value '" + ex.getValue()
                    + "' for parameter '" + ex.getName() + "'");
        }
        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }

    // Handles missing required @RequestParam (e.g. PATCH /updateBookingStatus/{id} called without ?status=)
    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<Map<String, Object>> handleMissingParam(MissingServletRequestParameterException ex) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", HttpStatus.BAD_REQUEST.value());
        body.put("error", "Bad Request");
        body.put("message", "Required request parameter '" + ex.getParameterName() + "' of type '"
                + ex.getParameterType() + "' is missing");
        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }

    // Handles @Valid / @Validated bean validation failures on request body fields
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationErrors(MethodArgumentNotValidException ex) {
        List<String> errors = ex.getBindingResult().getFieldErrors().stream()
                .map(fe -> fe.getField() + ": " + fe.getDefaultMessage())
                .collect(Collectors.toList());
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", HttpStatus.BAD_REQUEST.value());
        body.put("error", "Validation Failed");
        body.put("messages", errors);
        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }

    // Handles DB constraint violations (e.g. NOT NULL, FK violation, unique constraint)
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, Object>> handleDataIntegrity(DataIntegrityViolationException ex) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", HttpStatus.CONFLICT.value());
        body.put("error", "Data Integrity Violation");
        body.put("message", "The request violates a database constraint. "
                + "Ensure all required fields are present and all referenced records (e.g. shipper) exist.");
        return new ResponseEntity<>(body, HttpStatus.CONFLICT);
    }

    // Handles wrong HTTP method on an endpoint (e.g. GET on a POST-only route)
    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<Map<String, Object>> handleWrongMethod(HttpRequestMethodNotSupportedException ex) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", HttpStatus.METHOD_NOT_ALLOWED.value());
        body.put("error", "Method Not Allowed");
        body.put("message", "HTTP method '" + ex.getMethod() + "' is not supported for this endpoint. "
                + "Supported methods: " + ex.getSupportedHttpMethods());
        return new ResponseEntity<>(body, HttpStatus.METHOD_NOT_ALLOWED);
    }

    // Handles CSV file upload exceeding the configured size limit
    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<Map<String, Object>> handleMaxUploadSize(MaxUploadSizeExceededException ex) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", 413);
        body.put("error", "Payload Too Large");
        body.put("message", "Uploaded file exceeds the maximum allowed size. Please reduce the file size and try again.");
        return new ResponseEntity<>(body, HttpStatus.valueOf(413));
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleNotFound(ResourceNotFoundException ex) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", HttpStatus.NOT_FOUND.value());
        body.put("error", "Not Found");
        body.put("message", ex.getMessage());
        return new ResponseEntity<>(body, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<Map<String, Object>> handleBadRequest(BadRequestException ex) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", HttpStatus.BAD_REQUEST.value());
        body.put("error", "Bad Request");
        body.put("message", ex.getMessage());
        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }

    // Handles Spring MVC 6 path-not-found (prevents wrong URLs returning 500)
    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<Map<String, Object>> handleNoResource(NoResourceFoundException ex) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", HttpStatus.NOT_FOUND.value());
        body.put("error", "Not Found");
        body.put("message", "The requested path does not exist: " + ex.getResourcePath());
        return new ResponseEntity<>(body, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(NoHandlerFoundException.class)
    public ResponseEntity<Map<String, Object>> handleNoHandler(NoHandlerFoundException ex) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", HttpStatus.NOT_FOUND.value());
        body.put("error", "Not Found");
        body.put("message", "No endpoint found for " + ex.getHttpMethod() + " " + ex.getRequestURL());
        return new ResponseEntity<>(body, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGeneric(Exception ex) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
        body.put("error", "Internal Server Error");
        body.put("message", ex.getMessage());
        return new ResponseEntity<>(body, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}