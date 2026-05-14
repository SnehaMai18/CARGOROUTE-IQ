package com.example.demo.service;

import java.util.List;
import java.util.Map;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.multipart.MultipartFile;

import com.example.demo.dto.BookingDTO;
import com.example.demo.entity.enums.BookingStatus;

public interface BookingService {

    /**
     * Persist a new booking. createdByUserId is resolved internally from
     * the SecurityContext — never trusted from the request body.
     */
    public BookingDTO createBooking(BookingDTO b);

    /**
     * Retrieve bookings with role-based visibility:
     * <ul>
     *   <li>Admin / Dispatcher / read-only roles → all bookings</li>
     *   <li>Shipper → only bookings created by the caller</li>
     * </ul>
     * Role and userId are resolved internally from the SecurityContext.
     */
    public List<BookingDTO> getAllBookings();

    // Retrieve a single booking by its ID
    public BookingDTO getBookingById(Long id);


    // Update only the status field of an existing booking
    @PreAuthorize("hasAnyRole('DISPATCHER','DRIVER','WAREHOUSEMANAGER')")
    public BookingDTO updateBookingStatus(Long id, BookingStatus status);

    // Retrieve bookings by status
    public List<BookingDTO> getByBookingStatus(BookingStatus status);

    // Retrieve bookings by shipper ID
    public List<BookingDTO> getByShipperId(Long shipperID);

    // Bulk import bookings from a CSV file
    public Map<String, Object> importBookings(MultipartFile file) throws Exception;
}