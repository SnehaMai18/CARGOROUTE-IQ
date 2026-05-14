package com.example.demo.exceptions;

public class UserAccountDisabledException extends RuntimeException {
    public UserAccountDisabledException(String message) {
        super(message);
    }
}