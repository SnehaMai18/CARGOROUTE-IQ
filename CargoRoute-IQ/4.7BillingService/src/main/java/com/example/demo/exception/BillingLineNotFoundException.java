package com.example.demo.exception;

public class BillingLineNotFoundException extends RuntimeException {
    public BillingLineNotFoundException(String message) {
        super(message);
    }
}