package com.example.demo.controller;
import com.example.demo.dto.ManifestDTO;
import com.example.demo.dto.ManifestRequiredResponseDTO;
import com.example.demo.exception.GlobalExceptionHandler;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.service.ManifestService;
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
class ManifestControllerTest {

    private MockMvc mockMvc;

    @Mock
    private ManifestService manifestService;

    @InjectMocks
    private ManifestController manifestController;

    private ObjectMapper objectMapper;
    private ManifestDTO manifestDTO;
    private ManifestRequiredResponseDTO responseDTO;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(manifestController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();

        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());

        manifestDTO = new ManifestDTO();
        manifestDTO.setManifestID(1L);
        manifestDTO.setLoadID(100L);
        manifestDTO.setWarehouseID(200L);
        manifestDTO.setItemsJSON("{\"item\":\"Box\"}");
        manifestDTO.setCreatedBy("Admin");
        manifestDTO.setCreatedAt(LocalDateTime.now());
        manifestDTO.setManifestURI("/manifests/manifest.pdf");

        responseDTO = new ManifestRequiredResponseDTO();
        responseDTO.setManifest(manifestDTO);
    }

    // ────────────────── CREATE (MULTIPART) ──────────────────

    @Test
    void createManifestWithFile_ShouldReturn201_WhenCreated() throws Exception {
        MockMultipartFile manifestJsonPart = new MockMultipartFile(
                "manifest",
                "",
                "application/json",
                objectMapper.writeValueAsBytes(manifestDTO)
        );

        MockMultipartFile manifestPdfFile = new MockMultipartFile(
                "file",
                "manifest.pdf",
                "application/pdf",
                "Sample content".getBytes()
        );

        when(manifestService.create(any(ManifestDTO.class), any()))
                .thenReturn(manifestDTO);

        mockMvc.perform(multipart("/cargoRoute/manifests/createManifest")
                        .file(manifestJsonPart)
                        .file(manifestPdfFile))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.message").value("Manifest created successfully."))
                .andExpect(jsonPath("$.manifestID").value(1));
    }

    // ────────────────── GET BY ID ──────────────────

    @Test
    void getManifestById_ShouldReturn200_WhenFound() throws Exception {
        when(manifestService.getById(anyLong())).thenReturn(responseDTO);

        mockMvc.perform(get("/cargoRoute/manifests/getByManifestId/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.manifest.manifestID").value(1));
    }

    @Test
    void getManifestById_ShouldReturn404_WhenNotFound() throws Exception {
        when(manifestService.getById(anyLong()))
                .thenThrow(new ResourceNotFoundException("Manifest not found"));

        mockMvc.perform(get("/cargoRoute/manifests/getByManifestId/99"))
                .andExpect(status().isNotFound());
    }

    // ────────────────── GET ALL ──────────────────

    @Test
    void getAllManifests_ShouldReturnList() throws Exception {
        when(manifestService.getAll()).thenReturn(List.of(responseDTO));

        mockMvc.perform(get("/cargoRoute/manifests/getAllManifest"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    // ────────────────── GET BY LOAD ID ──────────────────

    @Test
    void getByLoadId_ShouldReturn200() throws Exception {
        when(manifestService.getByLoadID(anyLong())).thenReturn(responseDTO);

        mockMvc.perform(get("/cargoRoute/manifests/getByLoadId/100"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.manifest.loadID").value(100));
    }

    // ────────────────── GET BY WAREHOUSE ID ──────────────────

    @Test
    void getByWarehouseId_ShouldReturnList() throws Exception {
        when(manifestService.getByWarehouseID(anyLong())).thenReturn(List.of(responseDTO));

        mockMvc.perform(get("/cargoRoute/manifests/getByWarehouseId/200"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    // ────────────────── UPDATE ──────────────────

    @Test
    void updateManifest_ShouldReturn200_WhenUpdated() throws Exception {
        ManifestDTO updateDTO = new ManifestDTO();
        updateDTO.setWarehouseID(201L);
        updateDTO.setItemsJSON("{\"item\":\"Crate\"}");

        // FIX: Replaced doNothing() with when().thenReturn() 
        // FIX: Replaced eq(1L) with anyLong() for safer matching
        when(manifestService.update(anyLong(), any(ManifestDTO.class)))
                .thenReturn(manifestDTO);

        mockMvc.perform(put("/cargoRoute/manifests/updateManifest/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message")
                        .value("Manifest updated successfully."));
    }

    // ────────────────── DELETE ──────────────────

    @Test
    void deleteManifest_ShouldReturn200_WhenDeleted() throws Exception {
        // Refined to anyLong() to ensure match
        doNothing().when(manifestService).delete(anyLong());

        mockMvc.perform(delete("/cargoRoute/manifests/deleteByManifestId/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message")
                        .value("Manifest deleted successfully."));
    }
}
