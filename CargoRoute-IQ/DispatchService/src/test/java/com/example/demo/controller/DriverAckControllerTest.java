package com.example.demo.controller;
import com.example.demo.dto.DriverAckDTO;
import com.example.demo.dto.DriverAckResponseDTO;
import com.example.demo.dto.DispatchResponseDTO;
import com.example.demo.dto.DriverDTO;
import com.example.demo.exception.GlobalExceptionHandler;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.service.DriverAckService;
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
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class DriverAckControllerTest {

    private MockMvc mockMvc;

    @Mock
    private DriverAckService driverAckService;

    @InjectMocks
    private DriverAckController driverAckController;

    private ObjectMapper objectMapper;
    private DriverAckDTO driverAckDTO;
    private DriverAckResponseDTO responseDTO;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(driverAckController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();

        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());

        driverAckDTO = new DriverAckDTO();
        driverAckDTO.setAckID(1L);
        driverAckDTO.setDispatchID(10L);
        driverAckDTO.setDriverID(20L);
        driverAckDTO.setAckAt(LocalDateTime.now());
        driverAckDTO.setNotes("Acknowledged");

        responseDTO = new DriverAckResponseDTO();
        responseDTO.setAckID(1L);
        responseDTO.setAckAt(driverAckDTO.getAckAt());
        responseDTO.setNotes("Acknowledged");
        responseDTO.setDispatch(new DispatchResponseDTO());
        responseDTO.setDriver(new DriverDTO());
    }

    // CREATE
    @Test
    void createDriverAck_ShouldReturn201_WhenCreated() throws Exception {
        // Change: Added mocking for insert call
        when(driverAckService.insert(any(DriverAckDTO.class))).thenReturn(driverAckDTO);

        mockMvc.perform(post("/cargoRoute/driver-acknowledgement/createDriverAcknowledgement")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(driverAckDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.message").value("Driver acknowledgement created successfully."));

        verify(driverAckService).insert(any(DriverAckDTO.class));
    }

    // GET BY ID
    @Test
    void getByAckId_ShouldReturn200_WhenFound() throws Exception {
        when(driverAckService.fetchByID(1L)).thenReturn(responseDTO);

        mockMvc.perform(get("/cargoRoute/driver-acknowledgement/getByAckId/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ackID").value(1))
                .andExpect(jsonPath("$.notes").value("Acknowledged"));
    }

    @Test
    void getByAckId_ShouldReturn404_WhenNotFound() throws Exception {
        when(driverAckService.fetchByID(99L)).thenThrow(new ResourceNotFoundException("DriverAck not found"));

        mockMvc.perform(get("/cargoRoute/driver-acknowledgement/getByAckId/99"))
                .andExpect(status().isNotFound());
    }

    // GET BY DISPATCH ID
    @Test
    void getByDispatchId_ShouldReturn200_WhenFound() throws Exception {
        when(driverAckService.fetchByDispatchID(10L)).thenReturn(List.of(responseDTO));

        mockMvc.perform(get("/cargoRoute/driver-acknowledgement/getByDispatchId/10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].notes").value("Acknowledged"));
    }

    // GET BY DRIVER ID
    @Test
    void getByDriverId_ShouldReturn200_WhenFound() throws Exception {
        when(driverAckService.fetchByDriverID(20L)).thenReturn(List.of(responseDTO));

        mockMvc.perform(get("/cargoRoute/driver-acknowledgement/getByDriverId/20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].ackID").value(1));
    }

    // GET ALL
    @Test
    void getAllDriverAcknowledgements_ShouldReturn200_WithList() throws Exception {
        when(driverAckService.fetchAll()).thenReturn(List.of(responseDTO));

        mockMvc.perform(get("/cargoRoute/driver-acknowledgement/getAllDriverAcknowledgement"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    // UPDATE
    @Test
    void updateDriverAck_ShouldReturn200_WhenUpdated() throws Exception {
        // Change: Added mocking for update call and verified interaction
        when(driverAckService.updateDriverAck(eq(1L), any(DriverAckDTO.class))).thenReturn(driverAckDTO);

        mockMvc.perform(put("/cargoRoute/driver-acknowledgement/updateDriverAcknowledgement/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(driverAckDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Driver acknowledgement updated successfully."));

        verify(driverAckService).updateDriverAck(eq(1L), any(DriverAckDTO.class));
    }

    // DELETE
    @Test
    void deleteDriverAck_ShouldReturn200_WhenDeleted() throws Exception {
        mockMvc.perform(delete("/cargoRoute/driver-acknowledgement/deleteDriverAck/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Driver acknowledgement deleted successfully."));

        verify(driverAckService).delete(1L);
    }
}