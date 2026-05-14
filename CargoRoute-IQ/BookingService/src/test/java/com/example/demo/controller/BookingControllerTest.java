package com.example.demo.controller;

import com.example.demo.dto.BookingDTO;
import com.example.demo.dto.ShipperDTO;
import com.example.demo.entity.enums.BookingStatus;
import com.example.demo.exception.GlobalExceptionHandler;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.service.BookingService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class BookingControllerTest {

    private MockMvc mockMvc;

    @Mock
    private BookingService bookingService;

    @InjectMocks
    private BookingController bookingController;

    private ObjectMapper objectMapper;
    private BookingDTO bookingDTO;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(bookingController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();

        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());

        ShipperDTO shipperDTO = new ShipperDTO();
        shipperDTO.setShipperID(1L);
        shipperDTO.setName("Test Shipper");

        bookingDTO = new BookingDTO();
        bookingDTO.setBookingID(1L);
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

    // ── POST /cargoRoute/booking/addBooking ──────────────────────────────────

//    @Test
//    void addBooking_ShouldReturn201_WhenCreated() throws Exception {
//        when(bookingService.createBooking(any(BookingDTO.class), any())).thenReturn(bookingDTO);
//
//        mockMvc.perform(post("/cargoRoute/booking/addBooking")
//                        .contentType(MediaType.APPLICATION_JSON)
//                        .content(objectMapper.writeValueAsString(bookingDTO)))
//                .andExpect(status().isCreated())
//                .andExpect(jsonPath("$.message").value("Booking created successfully."));
//    }

    // ── GET /cargoRoute/booking/getBookings ──────────────────────────────────

//    @Test
//    void fetchAllBookings_ShouldReturn200_WithList() throws Exception {
//        when(bookingService.getAllBookings(any(), any())).thenReturn(List.of(bookingDTO));
//
//        mockMvc.perform(get("/cargoRoute/booking/getBookings"))
//                .andExpect(status().isOk())
//                .andExpect(jsonPath("$.length()").value(1))
//                .andExpect(jsonPath("$[0].bookingID").value(1));
//    }

//    @Test
//    void fetchAllBookings_ShouldReturn200_WithEmptyList() throws Exception {
//        when(bookingService.getAllBookings(any(), any())).thenReturn(List.of());
//
//        mockMvc.perform(get("/cargoRoute/booking/getBookings"))
//                .andExpect(status().isOk())
//                .andExpect(jsonPath("$.length()").value(0));
//    }

    // ── GET /cargoRoute/booking/getBooking/{id} ──────────────────────────────

    @Test
    void getByBookingId_ShouldReturn200_WhenFound() throws Exception {
        when(bookingService.getBookingById(1L)).thenReturn(bookingDTO);

        mockMvc.perform(get("/cargoRoute/booking/getBookingById/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.bookingID").value(1))
                .andExpect(jsonPath("$.commodity").value("Electronics"));
    }

    @Test
    void getByBookingId_ShouldReturn404_WhenNotFound() throws Exception {
        when(bookingService.getBookingById(99L))
                .thenThrow(new ResourceNotFoundException("Booking with ID 99 not found"));

        mockMvc.perform(get("/cargoRoute/booking/getBookingById/99"))
                .andExpect(status().isNotFound());
    }

    // ── PATCH /cargoRoute/booking/updateBookingStatus/{id} ───────────────────

    @Test
    void modifyBookingStatus_ShouldReturn200_WhenUpdated() throws Exception {
        when(bookingService.updateBookingStatus(eq(1L), eq(BookingStatus.PLANNED)))
                .thenReturn(bookingDTO);

        mockMvc.perform(patch("/cargoRoute/booking/updateBookingStatus/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"PLANNED\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Booking status updated successfully."));
    }

    @Test
    void modifyBookingStatus_ShouldReturn404_WhenBookingNotFound() throws Exception {
        when(bookingService.updateBookingStatus(eq(99L), any(BookingStatus.class)))
                .thenThrow(new ResourceNotFoundException("Booking with ID 99 not found"));

        mockMvc.perform(patch("/cargoRoute/booking/updateBookingStatus/99")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"PLANNED\"}"))
                .andExpect(status().isNotFound());
    }

    // ── GET /cargoRoute/booking/getBookingsByStatus/{status} ─────────────────

    @Test
    void fetchByBookingStatus_ShouldReturn200_WithMatchingBookings() throws Exception {
        when(bookingService.getByBookingStatus(BookingStatus.SUBMITTED))
                .thenReturn(List.of(bookingDTO));

        mockMvc.perform(get("/cargoRoute/booking/getBookingsByStatus/SUBMITTED"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].status").value("SUBMITTED"));
    }

    // ── GET /cargoRoute/booking/getBookingsByShipper/{shipperId} ─────────────

    @Test
    void getByShipperId_ShouldReturn200_WithBookings() throws Exception {
        when(bookingService.getByShipperId(1L)).thenReturn(List.of(bookingDTO));

        mockMvc.perform(get("/cargoRoute/booking/getBookingsByShipperID/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].shipper.shipperID").value(1));
    }
}
