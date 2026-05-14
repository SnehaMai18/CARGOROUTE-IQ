package com.example.demo.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.ExceptionRecordDTO;
import com.example.demo.dto.RequiredResponseDTO;
import com.example.demo.entity.enums.ExceptionStatus;
import com.example.demo.exception.BadRequestException;
import com.example.demo.service.ExceptionService;

@RestController 
@RequestMapping("/cargoRoute/exception") 
public class ExceptionController {

    @Autowired
    private ExceptionService service; 

    @PostMapping("/addException")
    // Create a new ExceptionRecord — allow Shipper and operational roles (Admin must not create)
    @PreAuthorize("hasAnyRole('SHIPPER','DISPATCHER','ADMIN')")
    public ResponseEntity<ExceptionRecordDTO> addException(@RequestBody ExceptionRecordDTO e) {
        ExceptionRecordDTO created = service.createException(e);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping("/getExceptions")
    // Retrieve exceptions; SHIPPER sees only their own records
//    @PreAuthorize("hasAnyRole('SHIPPER','DISPATCHER','ADMIN','FLEETMANAGER','WAREHOUSEMANAGER','BILLINGCLERK','ANALYST')")
    public ResponseEntity<List<RequiredResponseDTO>> fetchAllExceptions() {
        List<RequiredResponseDTO> all = service.getAllExceptions();
        return ResponseEntity.ok(all);
    }

    @GetMapping("/getExceptionByID/{id}")
    // Retrieve a single ExceptionRecord by ID with booking details
    public ResponseEntity<RequiredResponseDTO> fetchExceptionById(@PathVariable Long id) {
        if (id == null || id <= 0) {
            throw new BadRequestException("Exception ID must be a positive number.");
        }
        RequiredResponseDTO exception = service.getExceptionById(id);
        return new ResponseEntity<>(exception, HttpStatus.OK);
    }

    @PatchMapping("/updateExceptionStatus/{id}")
    // Partially update the exception: only the status field — allow operational roles (Dispatcher, Driver, WarehouseManager) and Admin
    @PreAuthorize("hasAnyRole('DISPATCHER','ADMIN')")
    public ResponseEntity<Map<String, String>> modifyExceptionStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        if (id == null || id <= 0) {
            throw new BadRequestException("Exception ID must be a positive number.");
        }
        String statusValue = body.get("status");
        if (statusValue == null || statusValue.isBlank()) {
            throw new BadRequestException("Status field is required in the request body.");
        }
        ExceptionStatus status = ExceptionStatus.fromValue(statusValue);
        service.updateExceptionStatus(id, status);
        return ResponseEntity.ok(Map.of("message", "Exception status updated successfully."));
    }

    @GetMapping("/getExceptionByBookingID/{bookingId}")
    // Retrieve all exceptions for a specific booking with booking details
    public ResponseEntity<List<RequiredResponseDTO>> fetchExceptionByBookingId(@PathVariable Long bookingId) {
        if (bookingId == null || bookingId <= 0) {
            throw new BadRequestException("Booking ID must be a positive number.");
        }
        List<RequiredResponseDTO> exceptions = service.getExceptionByBookingId(bookingId);
        return ResponseEntity.ok(exceptions);
    }

    @GetMapping("/getExceptionByStatus/{status}")
    // Retrieve all exceptions by status
    public ResponseEntity<List<RequiredResponseDTO>> fetchExceptionByStatus(@PathVariable ExceptionStatus status) {
        List<RequiredResponseDTO> exceptions = service.getExceptionByStatus(status);
        return ResponseEntity.ok(exceptions);
    }
}
