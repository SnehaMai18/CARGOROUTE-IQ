package com.example.demo.controller;
import com.example.demo.dto.ProofOfDeliveryDTO;
import com.example.demo.dto.ProofOfDeliveryResponseDTO;
import com.example.demo.entities.enums.PodType;
import com.example.demo.entities.enums.ProofOfDeliveryStatus;
import com.example.demo.exception.GlobalExceptionHandler;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.service.ProofOfDeliveryService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class ProofOfDeliveryControllerTest {

    private MockMvc mockMvc;

    @Mock
    private ProofOfDeliveryService service;

    @InjectMocks
    private ProofOfDeliveryController controller;

    private ObjectMapper objectMapper;
    private ProofOfDeliveryDTO podDTO;
    private ProofOfDeliveryResponseDTO responseDTO;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(controller)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();

        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());

        podDTO = new ProofOfDeliveryDTO();
        podDTO.setPodID(1L);
        podDTO.setBookingID(10L);
        podDTO.setDeliveredAt(LocalDateTime.now());
        podDTO.setReceivedBy("Customer");
        podDTO.setPodURI("/pods/pod-image.png");
        podDTO.setPodType(PodType.Photo);
        podDTO.setStatus(ProofOfDeliveryStatus.UPLOADED);

        responseDTO = new ProofOfDeliveryResponseDTO();
        responseDTO.setProofOfDelivery(podDTO);
        responseDTO.setBooking(null);
    }

    // ────────────────── CREATE (MULTIPART) ──────────────────

    @Test
    void createProofOfDeliveryWithImage_ShouldReturn201() throws Exception {
        MockMultipartFile podJsonPart = new MockMultipartFile(
                "pod", "", "application/json", objectMapper.writeValueAsBytes(podDTO));

        MockMultipartFile imageFilePart = new MockMultipartFile(
                "file", "pod.png", "image/png", "Sample POD image content".getBytes());

        when(service.create(any(ProofOfDeliveryDTO.class), any()))
                .thenReturn(podDTO);

        mockMvc.perform(multipart("/cargoRoute/proof-of-delivery/createProofOfDelivery")
                        .file(podJsonPart)
                        .file(imageFilePart))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.message").value("Proof Of Delivery created successfully"))
                .andExpect(jsonPath("$.podID").value(1));
    }

    // ────────────────── GET BY ID ──────────────────

    @Test
    void getById_ShouldReturn200_WhenFound() throws Exception {
        // Corrected: Using anyLong() for safer matching
        when(service.getById(anyLong())).thenReturn(responseDTO);

        mockMvc.perform(get("/cargoRoute/proof-of-delivery/getById/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.proofOfDelivery.podID").value(1));
    }

    @Test
    void getById_ShouldReturn404_WhenNotFound() throws Exception {
        when(service.getById(anyLong()))
                .thenThrow(new ResourceNotFoundException("POD not found"));

        mockMvc.perform(get("/cargoRoute/proof-of-delivery/getById/99"))
                .andExpect(status().isNotFound());
    }

    // ────────────────── GET ALL ──────────────────

    @Test
    void getAllProofOfDeliveries_ShouldReturnList() throws Exception {
        when(service.getAll()).thenReturn(List.of(responseDTO));

        mockMvc.perform(get("/cargoRoute/proof-of-delivery/getAllProofOfDeliveries"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    // ────────────────── UPDATE (FIXED) ──────────────────

    @Test
    void updateProofOfDelivery_ShouldReturn200() throws Exception {
        ProofOfDeliveryDTO updateDTO = new ProofOfDeliveryDTO();
        updateDTO.setReceivedBy("Updated Customer");
        updateDTO.setStatus(ProofOfDeliveryStatus.VERIFIED);

        // FIX: The service.update method returns ProofOfDeliveryDTO. 
        // We must use when(...).thenReturn(...) instead of doNothing().
        // We also use anyLong() for cleaner path variable matching.
        when(service.update(anyLong(), any(ProofOfDeliveryDTO.class)))
                .thenReturn(podDTO);

        mockMvc.perform(put("/cargoRoute/proof-of-delivery/updateProofOfDelivery/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Proof of Delivery updated successfully."));
    }

    // ────────────────── DELETE (FIXED) ──────────────────

    @Test
    void deleteProofOfDelivery_ShouldReturn200() throws Exception {
        // FIX: Ensure delete uses anyLong() to match the path variable
        doNothing().when(service).delete(anyLong());

        mockMvc.perform(delete("/cargoRoute/proof-of-delivery/deleteById/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Proof of Delivery deleted successfully."));
    }
}
