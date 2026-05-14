package com.example.demo.exceptions;

public class InvalidCredentialsException extends RuntimeException {
	public InvalidCredentialsException(String msg) {
		super(msg);
	}

}
