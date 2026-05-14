package com.example.demo.exception;

import org.springframework.http.HttpStatus;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import com.example.demo.exception.KPINotFoundException;

@ControllerAdvice
public class GlobalExceptionHandler {
   

    @ExceptionHandler(ReportNotFoundException.class)
    public ResponseEntity<String> handleReportNotFound(ReportNotFoundException ex) {
        return new ResponseEntity<>(ex.getMessage(), HttpStatus.NOT_FOUND);
    }
    @ExceptionHandler(KPINotFoundException.class)
    public ResponseEntity<String> handleKPINotFound(KPINotFoundException ex) {
        return new ResponseEntity<>(ex.getMessage(), HttpStatus.NOT_FOUND);
    }


}
