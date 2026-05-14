package com.example.demo.controller;

import com.example.demo.dto.ShipperDTO;

import com.example.demo.entity.enums.ShipperStatus;
import com.example.demo.exception.GlobalExceptionHandler;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.service.ShipperService;
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
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class ShipperControllerTest {

    private MockMvc mockMvc;

    @Mock
    private ShipperService shipperService;

    @InjectMocks
    private ShipperController shipperController;

    private ObjectMapper objectMapper;
    private ShipperDTO shipperDTO;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(shipperController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();

        objectMapper = new ObjectMapper();

        shipperDTO = new ShipperDTO();
        shipperDTO.setShipperID(1L);
        shipperDTO.setName("Test Shipper");
        shipperDTO.setContactInfo("test@email.com");
        shipperDTO.setAccountTerms("Net 30");
        shipperDTO.setStatus(ShipperStatus.ACTIVE);
    }

    // ── POST /cargoRoute/shipper/addShipper ──────────────────────────────────

    @Test
    void addShipper_ShouldReturn201_WhenCreated() throws Exception {
        when(shipperService.createShipper(any(ShipperDTO.class))).thenReturn(shipperDTO);

        mockMvc.perform(post("/cargoRoute/shipper/addShipper")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(shipperDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.message").value("Shipper created successfully."));
    }

    // ── GET /cargoRoute/shipper/getShippers ──────────────────────────────────

    @Test
    void fetchAllShippers_ShouldReturn200_WithList() throws Exception {
        when(shipperService.getAllShippers()).thenReturn(List.of(shipperDTO));

        mockMvc.perform(get("/cargoRoute/shipper/getShippers"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].shipperID").value(1))
                .andExpect(jsonPath("$[0].name").value("Test Shipper"));
    }

    @Test
    void fetchAllShippers_ShouldReturn200_WithEmptyList() throws Exception {
        when(shipperService.getAllShippers()).thenReturn(List.of());

        mockMvc.perform(get("/cargoRoute/shipper/getShippers"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    // ── GET /cargoRoute/shipper/getShipper/{id} ──────────────────────────────

    @Test
    void fetchShipperById_ShouldReturn200_WhenFound() throws Exception {
        when(shipperService.getShipperById(1L)).thenReturn(shipperDTO);

        mockMvc.perform(get("/cargoRoute/shipper/getShipper/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.shipperID").value(1))
                .andExpect(jsonPath("$.name").value("Test Shipper"));
    }

    @Test
    void fetchShipperById_ShouldReturn404_WhenNotFound() throws Exception {
        when(shipperService.getShipperById(99L))
                .thenThrow(new ResourceNotFoundException("Shipper with ID 99 not found"));

        mockMvc.perform(get("/cargoRoute/shipper/getShipper/99"))
                .andExpect(status().isNotFound());
    }

    // ── PUT /cargoRoute/shipper/updateShipper/{id} ───────────────────────────

    @Test
    void modifyShipper_ShouldReturn200_WhenUpdated() throws Exception {
        when(shipperService.createShipper(any(ShipperDTO.class))).thenReturn(shipperDTO);

        ShipperDTO updated = new ShipperDTO();
        updated.setShipperID(1L);
        updated.setName("Updated Shipper");
        updated.setStatus(ShipperStatus.INACTIVE);

        mockMvc.perform(put("/cargoRoute/shipper/updateShipper/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updated)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Shipper updated successfully."));
    }

    @Test
    void modifyShipper_ShouldReturn404_WhenNotFound() throws Exception {
        when(shipperService.createShipper(any(ShipperDTO.class)))
                .thenThrow(new ResourceNotFoundException("Shipper with ID 99 not found"));

        mockMvc.perform(put("/cargoRoute/shipper/updateShipper/99")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(shipperDTO)))
                .andExpect(status().isNotFound());
    }

    // ── GET /cargoRoute/shipper/getShippersByStatus/{status} ─────────────────

    @Test
    void fetchByShipperStatus_ShouldReturn200_WithMatchingShippers() throws Exception {
        when(shipperService.getByShipperStatus(ShipperStatus.ACTIVE))
                .thenReturn(List.of(shipperDTO));

        mockMvc.perform(get("/cargoRoute/shipper/getShippersByStatus/ACTIVE"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].status").value("ACTIVE"));
    }

    @Test
    void fetchByShipperStatus_ShouldReturn200_WithEmptyList() throws Exception {
        when(shipperService.getByShipperStatus(ShipperStatus.SUSPENDED))
                .thenReturn(List.of());

        mockMvc.perform(get("/cargoRoute/shipper/getShippersByStatus/SUSPENDED"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }
}
