package com.example.demo.services;

import com.example.demo.DTO.AuthRequestDTO;
import com.example.demo.DTO.AuthResponseDTO;
import com.example.demo.entities.User;

/**
 * AuthService
 * ------------
 * Handles authentication business logic.
 */
public interface AuthService {

    User signup(AuthRequestDTO request);

    AuthResponseDTO login(AuthRequestDTO request);

    void signout();
}