package com.example.demo.controller;


import com.example.demo.dto.ProofOfDeliveryDTO;
import com.example.demo.dto.ProofOfDeliveryResponseDTO;
import com.example.demo.entities.enums.PodType;
import com.example.demo.entities.enums.ProofOfDeliveryStatus;
import com.example.demo.exception.GlobalExceptionHandler;
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
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
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
        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());

        // Explicitly register the converter to ensure MockMvc handles JSON/Enums correctly
        mockMvc = MockMvcBuilders.standaloneSetup(controller)
                .setControllerAdvice(new GlobalExceptionHandler())
                .setMessageConverters(new MappingJackson2HttpMessageConverter(objectMapper))
                .build();

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
    }

    // ────────────────── CREATE (MULTIPART) ──────────────────

    @Test
    void createProofOfDeliveryWithImage_ShouldReturn201() throws Exception {
        // The "pod" part MUST have APPLICATION_JSON_VALUE content type
        MockMultipartFile podJsonPart = new MockMultipartFile(
                "pod", 
                "", 
                MediaType.APPLICATION_JSON_VALUE, 
                objectMapper.writeValueAsBytes(podDTO)
        );

        MockMultipartFile imageFilePart = new MockMultipartFile(
                "file", 
                "pod.png", 
                MediaType.IMAGE_PNG_VALUE, 
                "Sample POD image content".getBytes()
        );

        // Service returns DTO (adjust based on your service's real return type)
        when(service.create(any(ProofOfDeliveryDTO.class), any())).thenReturn(podDTO);

        mockMvc.perform(multipart("/cargoRoute/proof-of-delivery/createProofOfDelivery")
                        .file(podJsonPart)
                        .file(imageFilePart))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.message").value("Proof Of Delivery created successfully."));
    }

    // ────────────────── FETCHING METHODS ──────────────────

    @Test
    void getById_ShouldReturn200_WhenFound() throws Exception {
        when(service.getById(1L)).thenReturn(responseDTO);

        mockMvc.perform(get("/cargoRoute/proof-of-delivery/getById/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.proofOfDelivery.podID").value(1));
    }

    @Test
    void getByBookingId_ShouldReturn200() throws Exception {
        when(service.getByBookingID(10L)).thenReturn(responseDTO);

        mockMvc.perform(get("/cargoRoute/proof-of-delivery/getByBookingId/10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.proofOfDelivery.bookingID").value(10));
    }

    @Test
    void getByPodType_ShouldReturnList() throws Exception {
        // Use the exact Enum string expected by the URL
        when(service.getByPodType(PodType.Photo)).thenReturn(List.of(responseDTO));

        mockMvc.perform(get("/cargoRoute/proof-of-delivery/getByType/Photo"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].proofOfDelivery.podType").value("Photo"));
    }

    @Test
    void getByStatus_ShouldReturnList() throws Exception {
        when(service.getByProofOfDeliveryStatus(ProofOfDeliveryStatus.UPLOADED)).thenReturn(List.of(responseDTO));

        mockMvc.perform(get("/cargoRoute/proof-of-delivery/getByStatus/UPLOADED"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].proofOfDelivery.status").value("UPLOADED"));
    }

    @Test
    void getByDriverId_ShouldReturnList() throws Exception {
        when(service.getByDriverId(5L)).thenReturn(List.of(responseDTO));

        mockMvc.perform(get("/cargoRoute/proof-of-delivery/getByDriverId/5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    void getAllProofOfDeliveries_ShouldReturnList() throws Exception {
        when(service.getAll()).thenReturn(List.of(responseDTO));

        mockMvc.perform(get("/cargoRoute/proof-of-delivery/getAllProofOfDeliveries"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    // ────────────────── UPDATE & DELETE ──────────────────

    @Test
    void updateProofOfDelivery_ShouldReturn200() throws Exception {
        // Assuming your service.update returns ProofOfDeliveryDTO
        when(service.update(anyLong(), any(ProofOfDeliveryDTO.class))).thenReturn(podDTO);

        mockMvc.perform(put("/cargoRoute/proof-of-delivery/updateProofOfDelivery/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(podDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Proof of Delivery updated successfully."));
    }

    @Test
    void deleteProofOfDelivery_ShouldReturn200() throws Exception {
        doNothing().when(service).delete(1L);

        mockMvc.perform(delete("/cargoRoute/proof-of-delivery/deleteById/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Proof of Delivery deleted successfully."));
    }
}