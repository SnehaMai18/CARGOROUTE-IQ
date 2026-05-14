package com.example.demo.exceptions;

/**
 * Thrown when an invalid user role is provided.
 */
public class InvalidUserRoleException extends RuntimeException {

    public InvalidUserRoleException(String message) {
        super(message);
    }
}