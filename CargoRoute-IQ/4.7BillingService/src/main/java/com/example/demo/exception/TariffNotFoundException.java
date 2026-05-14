package com.example.demo.exception;

public class TariffNotFoundException extends RuntimeException {
    public TariffNotFoundException(String message) {
        super(message);
    }
}