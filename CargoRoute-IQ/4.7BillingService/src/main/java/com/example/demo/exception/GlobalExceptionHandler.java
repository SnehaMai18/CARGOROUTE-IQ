package com.example.demo.exception;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // ── 404 Handlers ────────────────────────────────────────────────

    @ExceptionHandler(BillingLineNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleBillingLineNotFound(BillingLineNotFoundException ex) {
        return buildResponse(HttpStatus.NOT_FOUND, "Billing Line Not Found", ex.getMessage());
    }

    @ExceptionHandler(InvoiceNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleInvoiceNotFound(InvoiceNotFoundException ex) {
        return buildResponse(HttpStatus.NOT_FOUND, "Invoice Not Found", ex.getMessage());
    }

    @ExceptionHandler(TariffNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleTariffNotFound(TariffNotFoundException ex) {
        return buildResponse(HttpStatus.NOT_FOUND, "Tariff Not Found", ex.getMessage());
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleResourceNotFound(ResourceNotFoundException ex) {
        return buildResponse(HttpStatus.NOT_FOUND, "Resource Not Found", ex.getMessage());
    }

    // ── 400 Handlers ────────────────────────────────────────────────

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgument(IllegalArgumentException ex) {
        return buildResponse(HttpStatus.BAD_REQUEST, "Invalid Request", ex.getMessage());
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<Map<String, Object>> handleTypeMismatch(MethodArgumentTypeMismatchException ex) {
        String message = "Invalid value '" + ex.getValue() + "' for parameter '" + ex.getName() + "'";
        return buildResponse(HttpStatus.BAD_REQUEST, "Type Mismatch", message);
    }

    // ── 500 Fallback ─────────────────────────────────────────────────

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGeneric(Exception ex) {
        return buildResponse(HttpStatus.INTERNAL_SERVER_ERROR, "Something went wrong",
                "An unexpected error occurred. Please try again later.");
    }

    // ── Helper ───────────────────────────────────────────────────────

    private ResponseEntity<Map<String, Object>> buildResponse(HttpStatus status, String error, String message) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now().toString());
        body.put("status", status.value());
        body.put("error", error);
        body.put("message", message);
        return new ResponseEntity<>(body, status);
    }
}