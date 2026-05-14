package com.example.demo.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // Handle resource not found
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleResourceNotFound(ResourceNotFoundException ex) {

        Map<String, Object> response = new HashMap<>();
        response.put("timestamp", LocalDateTime.now());
        response.put("status", HttpStatus.NOT_FOUND.value());
        response.put("error", "NOT FOUND");
        response.put("message", ex.getMessage());

        return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
    }
    
    
    // Handle invalid credentials not found
    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<Map<String, Object>> handleInvalidCredentials(InvalidCredentialsException ex) {

        Map<String, Object> response = new HashMap<>();
        response.put("timestamp", LocalDateTime.now());
        response.put("status", HttpStatus.UNAUTHORIZED.value());
        response.put("error", "UNAUTHORIZED");
        response.put("message", ex.getMessage());

        return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
    }

 
    
 
        @ExceptionHandler(UserNotFoundException.class)
        public ResponseEntity<?> handleUserNotFound(UserNotFoundException ex) {
            return build(HttpStatus.NOT_FOUND, "USER NOT FOUND", ex.getMessage());
        }


        @ExceptionHandler(DuplicateEmailException.class)
        public ResponseEntity<?> handleDuplicateEmail(DuplicateEmailException ex) {
            return build(HttpStatus.CONFLICT, "DUPLICATE EMAIL", ex.getMessage());
        }


        @ExceptionHandler(UserAccountDisabledException.class)
        public ResponseEntity<?> handleInactiveUser(UserAccountDisabledException ex) {
            return build(HttpStatus.FORBIDDEN, "ACCOUNT DISABLED", ex.getMessage());
        }



        private ResponseEntity<Map<String, Object>> build(
                HttpStatus status, String error, String message) {

            Map<String, Object> response = new HashMap<>();
            response.put("timestamp", LocalDateTime.now());
            response.put("status", status.value());
            response.put("error", error);
            response.put("message", message);

            return new ResponseEntity<>(response, status);
        }
        
        @ExceptionHandler(InvalidUserRoleException.class)
        public ResponseEntity<?> handleInvalidRole(InvalidUserRoleException ex) {

            Map<String, Object> response = new HashMap<>();
            response.put("timestamp", LocalDateTime.now());
            response.put("status", 400);
            response.put("error", "INVALID ROLE");
            response.put("message", ex.getMessage());

            return ResponseEntity.badRequest().body(response);
        }

        
        // Handle generic exceptions
        @ExceptionHandler(Exception.class)
        public ResponseEntity<Map<String, Object>> handleGlobalException(Exception ex) {

            Map<String, Object> response = new HashMap<>();
            response.put("timestamp", LocalDateTime.now());
            response.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
            response.put("error", "INTERNAL SERVER ERROR");
            response.put("message", ex.getMessage());

            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
}