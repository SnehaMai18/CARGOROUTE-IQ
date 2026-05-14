package com.example.demo.controller;

import com.example.demo.dto.ExceptionRecordDTO;
import com.example.demo.dto.RequiredResponseDTO;
import com.example.demo.entity.enums.ExceptionStatus;
import com.example.demo.entity.enums.ExceptionType;
import com.example.demo.exception.GlobalExceptionHandler;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.service.ExceptionService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class ExceptionControllerTest {

    private MockMvc mockMvc;

    @Mock
    private ExceptionService service;

    @InjectMocks
    private ExceptionController exceptionController;

    private ObjectMapper objectMapper;
    private ExceptionRecordDTO recordDTO;
    private RequiredResponseDTO requiredResponseDTO;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(exceptionController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();

        objectMapper = new ObjectMapper();

        recordDTO = new ExceptionRecordDTO();
        recordDTO.setExceptionID(1L);
        recordDTO.setType(ExceptionType.DELAY);
        recordDTO.setReportedBy(1L);
        recordDTO.setDescription("Cargo delayed at port");
        recordDTO.setStatus(ExceptionStatus.PENDING);
        recordDTO.setBookingId(1L);

        requiredResponseDTO = new RequiredResponseDTO();
        requiredResponseDTO.setExceptiondto(recordDTO);
        requiredResponseDTO.setBookingdto(null);
    }

    // ── POST /cargoRoute/exception/addException ──────────────────────────────

    @Test
    void addException_ShouldReturn201_WhenCreated() throws Exception {
        when(service.createException(any(ExceptionRecordDTO.class))).thenReturn(recordDTO);

        mockMvc.perform(post("/cargoRoute/exception/addException")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(recordDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.exceptionID").value(1))
                .andExpect(jsonPath("$.type").value("DELAY"));
    }

    // ── GET /cargoRoute/exception/getExceptions ──────────────────────────────

    @Test
    void fetchAllExceptions_ShouldReturn200_WithList() throws Exception {
        when(service.getAllExceptions()).thenReturn(List.of(requiredResponseDTO));

        mockMvc.perform(get("/cargoRoute/exception/getExceptions"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].exceptiondto.exceptionID").value(1))
                .andExpect(jsonPath("$[0].exceptiondto.type").value("DELAY"));
    }

    @Test
    void fetchAllExceptions_ShouldReturn200_WithEmptyList() throws Exception {
        when(service.getAllExceptions()).thenReturn(List.of());

        mockMvc.perform(get("/cargoRoute/exception/getExceptions"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    // ── GET /cargoRoute/exception/getException/{id} ──────────────────────────

    @Test
    void fetchExceptionById_ShouldReturn200_WhenFound() throws Exception {
        when(service.getExceptionById(1L)).thenReturn(requiredResponseDTO);

        mockMvc.perform(get("/cargoRoute/exception/getExceptionByID/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.exceptiondto.exceptionID").value(1))
                .andExpect(jsonPath("$.exceptiondto.reportedBy").value(1));
    }

    @Test
    void fetchExceptionById_ShouldReturn404_WhenNotFound() throws Exception {
        when(service.getExceptionById(99L))
                .thenThrow(new ResourceNotFoundException("Exception with ID 99 not found"));

        mockMvc.perform(get("/cargoRoute/exception/getExceptionByID/99"))
                .andExpect(status().isNotFound());
    }

    // ── PATCH /cargoRoute/exception/updateExceptionStatus/{id} ───────────────

    @Test
    void modifyExceptionStatus_ShouldReturn200_WhenUpdated() throws Exception {
        when(service.updateExceptionStatus(1L, ExceptionStatus.RESOLVED)).thenReturn(recordDTO);

        mockMvc.perform(patch("/cargoRoute/exception/updateExceptionStatus/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"RESOLVED\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Exception status updated successfully."));
    }

    @Test
    void modifyExceptionStatus_ShouldReturn404_WhenNotFound() throws Exception {
        when(service.updateExceptionStatus(eq(99L), any(ExceptionStatus.class)))
                .thenThrow(new ResourceNotFoundException("Exception with ID 99 not found"));

        mockMvc.perform(patch("/cargoRoute/exception/updateExceptionStatus/99")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"RESOLVED\"}"))
                .andExpect(status().isNotFound());
    }

    // ── GET /cargoRoute/exception/getExceptionByBooking/{bookingId} ──────────

    @Test
    void fetchExceptionByBookingId_ShouldReturn200_WithList() throws Exception {
        when(service.getExceptionByBookingId(1L)).thenReturn(List.of(requiredResponseDTO));

        mockMvc.perform(get("/cargoRoute/exception/getExceptionByBookingID/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].exceptiondto.exceptionID").value(1));
    }

    // ── GET /cargoRoute/exception/getExceptionByStatus/{status} ──────────────

    @Test
    void fetchExceptionByStatus_ShouldReturn200_WithList() throws Exception {
        when(service.getExceptionByStatus(ExceptionStatus.PENDING))
                .thenReturn(List.of(requiredResponseDTO));

        mockMvc.perform(get("/cargoRoute/exception/getExceptionByStatus/PENDING"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].exceptiondto.status").value("PENDING"));
    }
}
