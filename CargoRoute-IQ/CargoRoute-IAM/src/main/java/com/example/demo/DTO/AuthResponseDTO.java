package com.example.demo.DTO;

/**
 * AuthResponseDTO
 * ----------------
 * Returned after successful login.
 */
public class AuthResponseDTO {

    private String token;

    public AuthResponseDTO(String token) {
        this.token = token;
    }

    public String getToken() {
        return token;
    }
}