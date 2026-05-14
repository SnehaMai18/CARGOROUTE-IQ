package com.example.demo.controller;


import com.example.demo.dto.HandoverDTO;
import com.example.demo.dto.HandoverResponseDTO;
import com.example.demo.dto.ManifestRequiredResponseDTO;
import com.example.demo.exception.GlobalExceptionHandler;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.service.HandoverService;
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
class HandoverControllerTest {

    private MockMvc mockMvc;

    @Mock
    private HandoverService handoverService;

    @InjectMocks
    private HandoverController handoverController;

    private ObjectMapper objectMapper;
    private HandoverDTO handoverDTO;
    private HandoverResponseDTO responseDTO;

    @BeforeEach
    void setUp() {

        mockMvc = MockMvcBuilders.standaloneSetup(handoverController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();

        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());

        handoverDTO = new HandoverDTO();
        handoverDTO.setHandoverID(1L);
        handoverDTO.setManifestID(10L);
        handoverDTO.setHandedBy("Warehouse Admin");
        handoverDTO.setHandedAt(LocalDateTime.now());
        handoverDTO.setReceivedBy("Driver");
        handoverDTO.setReceivedAt(LocalDateTime.now().plusHours(2));
        handoverDTO.setNotes("Handover completed");

        responseDTO = new HandoverResponseDTO();
        responseDTO.setHandover(handoverDTO);
        responseDTO.setManifestDetails(new ManifestRequiredResponseDTO());
    }

    // ── CREATE ─────────────────────────────────────

    @Test
    void createHandover_ShouldReturn201_WhenCreated() throws Exception {

        when(handoverService.create(any(HandoverDTO.class)))
                .thenReturn(handoverDTO);

        mockMvc.perform(post("/cargoRoute/handovers/createHandover")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(handoverDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.message")
                        .value("Handover created successfully."));
    }

    // ── GET BY ID ─────────────────────────────────

    @Test
    void getByHandoverId_ShouldReturn200_WhenFound() throws Exception {

        when(handoverService.getById(1L))
                .thenReturn(responseDTO);

        mockMvc.perform(get("/cargoRoute/handovers/getByHandoverId/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.handover.handoverID").value(1))
                .andExpect(jsonPath("$.handover.manifestID").value(10));
    }

    @Test
    void getByHandoverId_ShouldReturn404_WhenNotFound() throws Exception {

        when(handoverService.getById(99L))
                .thenThrow(new ResourceNotFoundException("Handover not found"));

        mockMvc.perform(get("/cargoRoute/handovers/getByHandoverId/99"))
                .andExpect(status().isNotFound());
    }

    // ── GET ALL ───────────────────────────────────

    @Test
    void getAllHandovers_ShouldReturn200_WithList() throws Exception {

        when(handoverService.getAll())
                .thenReturn(List.of(responseDTO));

        mockMvc.perform(get("/cargoRoute/handovers/getAllHandovers"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    // ── GET BY MANIFEST ID ────────────────────────

    @Test
    void getByManifestId_ShouldReturn200_WhenFound() throws Exception {

        when(handoverService.getByManifestID(10L))
                .thenReturn(List.of(responseDTO));

        mockMvc.perform(get("/cargoRoute/handovers/getByManifestId/10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].handover.manifestID").value(10));
    }

    // ── GET BY HANDED BY ─────────────────────────

    @Test
    void getByHandedBy_ShouldReturn200_WithList() throws Exception {

        when(handoverService.getByHandedBy("Warehouse Admin"))
                .thenReturn(List.of(responseDTO));

        mockMvc.perform(get("/cargoRoute/handovers/getHanded-by/Warehouse Admin"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    // ── UPDATE ──────────────────────────────────

    @Test
    void updateHandover_ShouldReturn200_WhenUpdated() throws Exception {

        when(handoverService.update(eq(1L), any(HandoverDTO.class)))
                .thenReturn(handoverDTO);

        mockMvc.perform(put("/cargoRoute/handovers/updateHandover/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(handoverDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message")
                        .value("Handover updated successfully."));
    }

    // ── DELETE ──────────────────────────────────

    @Test
    void deleteHandover_ShouldReturn200_WhenDeleted() throws Exception {

        mockMvc.perform(delete("/cargoRoute/handovers/deleteByHandoverId/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message")
                        .value("Handover deleted successfully."));
    }
}