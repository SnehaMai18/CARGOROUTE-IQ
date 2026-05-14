package com.example.demo.controllers;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.demo.DTO.AuthRequestDTO;
import com.example.demo.DTO.AuthResponseDTO;
import com.example.demo.services.AuthService;

/**
 * AuthController
 * ---------------
 * Handles authentication APIs.
 */
@RestController
@RequestMapping("/cargoRoute/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * User registration API
     */
    @PostMapping("/signup")
    public ResponseEntity<String> signup(@RequestBody AuthRequestDTO request) {

        authService.signup(request);  // ✅ delegate to service

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body("Your account has been created successfully");
    }

    /**
     * User login API
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@RequestBody AuthRequestDTO request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/signout")
    public ResponseEntity<String> signout() {
        authService.signout();
        return ResponseEntity.ok("Signed out successfully");
    }
}