package com.example.demo.service;

import com.example.demo.dto.BookingDTO;
import com.example.demo.dto.ShipperDTO;
import com.example.demo.entity.Booking;
import com.example.demo.entity.Shipper;
import com.example.demo.entity.enums.BookingStatus;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.BookingRepository;
import com.example.demo.repository.ShipperRepository;
import com.example.demo.serviceimpl.BookingServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BookingServiceImplTest {

    @Mock
    private BookingRepository repo;

    @Mock
    private ShipperRepository shipperRepo;

    @InjectMocks
    private BookingServiceImpl bookingService;

    private Shipper shipper;
    private ShipperDTO shipperDTO;
    private Booking booking;
    private BookingDTO bookingDTO;

    @BeforeEach
    void setUp() {
        shipper = new Shipper();
        shipper.setShipperID(1L);
        shipper.setName("Test Shipper");

        shipperDTO = new ShipperDTO();
        shipperDTO.setShipperID(1L);
        shipperDTO.setName("Test Shipper");

        booking = new Booking();
        booking.setBookingID(1L);
        booking.setShipper(shipper);
        booking.setOriginSiteID(10L);
        booking.setDestinationSiteID(20L);
        booking.setWeightKg(500.0);
        booking.setVolumeM3(10.0);
        booking.setPieces(5);
        booking.setCommodity("Electronics");
        booking.setStatus(BookingStatus.SUBMITTED);
        booking.setPickupWindowStart(LocalDateTime.now().plusDays(1));
        booking.setPickupWindowEnd(LocalDateTime.now().plusDays(2));

        bookingDTO = new BookingDTO();
        bookingDTO.setShipper(shipperDTO);
        bookingDTO.setOriginSiteID(10L);
        bookingDTO.setDestinationSiteID(20L);
        bookingDTO.setWeightKg(500.0);
        bookingDTO.setVolumeM3(10.0);
        bookingDTO.setPieces(5);
        bookingDTO.setCommodity("Electronics");
        bookingDTO.setStatus(BookingStatus.SUBMITTED);
        bookingDTO.setPickupWindowStart(LocalDateTime.now().plusDays(1));
        bookingDTO.setPickupWindowEnd(LocalDateTime.now().plusDays(2));
    }

    // ── createBooking ────────────────────────────────────────────────────────

//    @Test
//    void createBooking_ShouldSaveAndReturnDTO() {
//        when(shipperRepo.findById(1L)).thenReturn(Optional.of(shipper));
//        when(repo.save(any(Booking.class))).thenReturn(booking);
//
//        BookingDTO result = bookingService.createBooking(bookingDTO, 1L);
//
//        assertEquals(BookingStatus.SUBMITTED, result.getStatus());
//    }
//
//    // ── getAllBookings ────────────────────────────────────────────────────────
//
//    @Test
//    void getAllBookings_ShouldReturnAllBookings() {
//        when(repo.findAll()).thenReturn(List.of(booking));
//
//        List<BookingDTO> result = bookingService.getAllBookings(null, "Admin");
//
//        assertEquals(1, result.size());
//    }

    // ── getBookingById ───────────────────────────────────────────────────────

    @Test
    void getBookingById_ShouldReturnBooking_WhenFound() {
        when(repo.findById(1L)).thenReturn(Optional.of(booking));

        BookingDTO result = bookingService.getBookingById(1L);

        assertNotNull(result);
        assertEquals(1L, result.getBookingID());
        assertEquals("Electronics", result.getCommodity());
    }

    @Test
    void getBookingById_ShouldThrowException_WhenNotFound() {
        when(repo.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> bookingService.getBookingById(99L));
    }

    // ── updateBookingStatus ──────────────────────────────────────────────────

    @Test
    void updateBookingStatus_ShouldUpdateAndReturnDTO() {
        booking.setStatus(BookingStatus.SUBMITTED);
        Booking updated = new Booking();
        updated.setBookingID(1L);
        updated.setShipper(shipper);
        updated.setStatus(BookingStatus.PLANNED);
        updated.setOriginSiteID(10L);
        updated.setDestinationSiteID(20L);

        when(repo.findById(1L)).thenReturn(Optional.of(booking));
        when(repo.save(any(Booking.class))).thenReturn(updated);

        BookingDTO result = bookingService.updateBookingStatus(1L, BookingStatus.PLANNED);

        assertEquals(BookingStatus.PLANNED, result.getStatus());
        verify(repo, times(1)).save(any(Booking.class));
    }

    @Test
    void updateBookingStatus_ShouldThrowException_WhenBookingNotFound() {
        when(repo.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> bookingService.updateBookingStatus(99L, BookingStatus.CANCELLED));
    }

    // ── getByBookingStatus ───────────────────────────────────────────────────

    @Test
    void getByBookingStatus_ShouldReturnMatchingBookings() {
        when(repo.findByStatus(BookingStatus.SUBMITTED)).thenReturn(List.of(booking));

        List<BookingDTO> result = bookingService.getByBookingStatus(BookingStatus.SUBMITTED);

        assertEquals(1, result.size());
        assertEquals(BookingStatus.SUBMITTED, result.get(0).getStatus());
    }

    @Test
    void getByBookingStatus_ShouldReturnEmpty_WhenNoMatch() {
        when(repo.findByStatus(BookingStatus.CANCELLED)).thenReturn(List.of());

        List<BookingDTO> result = bookingService.getByBookingStatus(BookingStatus.CANCELLED);

        assertTrue(result.isEmpty());
    }

    // ── getByShipperId ───────────────────────────────────────────────────────

    @Test
    void getByShipperId_ShouldReturnBookingsForShipper() {
        when(repo.findByShipper_ShipperID(1L)).thenReturn(List.of(booking));

        List<BookingDTO> result = bookingService.getByShipperId(1L);

        assertEquals(1, result.size());
        assertEquals(1L, result.get(0).getShipper().getShipperID());
    }

    @Test
    void getByShipperId_ShouldReturnEmpty_WhenShipperHasNoBookings() {
        when(repo.findByShipper_ShipperID(99L)).thenReturn(List.of());

        List<BookingDTO> result = bookingService.getByShipperId(99L);

        assertTrue(result.isEmpty());
    }
}
