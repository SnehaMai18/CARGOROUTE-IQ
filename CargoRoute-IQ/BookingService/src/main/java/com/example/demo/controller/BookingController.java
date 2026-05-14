package com.example.demo.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.demo.dto.BookingDTO;
import com.example.demo.entity.enums.BookingStatus;
import com.example.demo.service.BookingService;

@RestController 
@RequestMapping("/cargoRoute/booking") 
public class BookingController {

    @Autowired
    private BookingService service;

    @PostMapping("/addBooking")
    @PreAuthorize("hasAnyRole('SHIPPER','ADMIN')")
    public ResponseEntity<Map<String, String>> addBooking(@RequestBody BookingDTO b) {
        service.createBooking(b);
        return new ResponseEntity<>(Map.of("message", "Booking created successfully."), HttpStatus.CREATED);
    }

    @GetMapping("/getBookings")
//    @PreAuthorize("hasAnyRole('Shipper','Dispatcher','Admin','FleetManager','WarehouseManager','BillingClerk','Analyst')")
    public ResponseEntity<List<BookingDTO>> fetchAllBookings() {
        List<BookingDTO> bookings = service.getAllBookings();
        return ResponseEntity.ok(bookings);
    }

    @GetMapping("/getBookingById/{id}")
    // No @PreAuthorize here — SecurityConfig already grants permitAll() for this path
    // to support service-to-service calls (e.g. ExceptionService) that have no JWT.
    // Authenticated users (SHIPPER/DISPATCHER/ADMIN) are also allowed by the permitAll rule.
    public ResponseEntity<BookingDTO> getByBookingId(@PathVariable Long id) {
        BookingDTO booking = service.getBookingById(id);
        return ResponseEntity.ok(booking);
    }

    @PatchMapping("/updateBookingStatus/{id}")
    @PreAuthorize("hasAnyRole('DISPATCHER','DRIVER')")
    public ResponseEntity<Map<String, String>> modifyBookingStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String statusValue = body.get("status");
        if (statusValue == null || statusValue.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Status field is required in the request body."));
        }
        BookingStatus status = BookingStatus.fromValue(statusValue);
        service.updateBookingStatus(id, status);
        return ResponseEntity.ok(Map.of("message", "Booking status updated successfully."));
    }

    @GetMapping("/getBookingsByStatus/{status}")
//    @PreAuthorize("hasAnyRole('Shipper','Dispatcher','Admin','WarehouseManager','Analyst')")
    public ResponseEntity<List<BookingDTO>> fetchByBookingStatus(@PathVariable BookingStatus status) {
        List<BookingDTO> bookings = service.getByBookingStatus(status);
        return ResponseEntity.ok(bookings);
    }

    @GetMapping("/getBookingsByShipperID/{shipperId}")
//    @PreAuthorize("hasAnyRole('SHIPPER','DISPATCHER','ADMIN')")
    public ResponseEntity<List<BookingDTO>> getByShipperId(@PathVariable Long shipperId) {
        List<BookingDTO> bookings = service.getByShipperId(shipperId);
        return ResponseEntity.ok(bookings);
    }

    @PostMapping("/importBookings")
    @PreAuthorize("hasAnyRole('SHIPPER','ADMIN')")
    public ResponseEntity<Map<String, Object>> importBookings(@RequestParam("file") MultipartFile file) {
        try {
            Map<String, Object> result = service.importBookings(file);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

}         