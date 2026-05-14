package com.example.demo.controller;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import com.example.demo.dto.LoadDTO;
import com.example.demo.dto.RequiredResponseDTO;
import com.example.demo.service.LoadService;
import com.fasterxml.jackson.databind.ObjectMapper;

@WebMvcTest(LoadController.class)
@ExtendWith(MockitoExtension.class)
class LoadControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Mock
    private LoadService loadService;

    @Autowired
    private ObjectMapper objectMapper;

    private LoadDTO loadDTO;
    private RequiredResponseDTO responseDTO;

    @BeforeEach
    void setUp() {
        loadDTO = new LoadDTO();
        loadDTO.setLoadID(1L);
        loadDTO.setLoadCode("Pharma-001");
        loadDTO.setTotalWeightKg(500.0);
        loadDTO.setTotalVolumeM3(10.0);
        loadDTO.setStatus("PENDING");

        responseDTO = new RequiredResponseDTO();
        LoadDTO dtoForResponse = new LoadDTO();
        dtoForResponse.setLoadID(1L);
        dtoForResponse.setLoadCode("Pharma-001");
        dtoForResponse.setStatus("PENDING");
        responseDTO.setLoadDto(dtoForResponse);
    }

    @Test
    void testGetLoadById_Success() throws Exception {
        when(loadService.getLoadById(1L)).thenReturn(responseDTO);

        mockMvc.perform(get("/cargoRoute/loads/getLoad/1")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.loadDto.loadID").value(1L))
                .andExpect(jsonPath("$.loadDto.loadCode").value("Pharma-001"))
                .andExpect(jsonPath("$.loadDto.status").value("PENDING"));

        verify(loadService, times(1)).getLoadById(1L);
    }

    @Test
    void testGetLoadById_NotFound() throws Exception {
        when(loadService.getLoadById(999L)).thenReturn(null);

        mockMvc.perform(get("/cargoRoute/loads/getLoad/999")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());

        verify(loadService, times(1)).getLoadById(999L);
    }

    @Test
    void testGetAllLoads_Success() throws Exception {
        RequiredResponseDTO response2 = new RequiredResponseDTO();
        LoadDTO dto2 = new LoadDTO();
        dto2.setLoadID(2L);
        dto2.setLoadCode("Electronics-001");
        dto2.setStatus("IN_TRANSIT");
        response2.setLoadDto(dto2);

        when(loadService.getAllLoads()).thenReturn(List.of(responseDTO, response2));

        mockMvc.perform(get("/cargoRoute/loads/getAllLoads")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].loadDto.loadID").value(1L))
                .andExpect(jsonPath("$[1].loadDto.loadID").value(2L))
                .andExpect(jsonPath("$.length()").value(2));

        verify(loadService, times(1)).getAllLoads();
    }

    @Test
    void testGetAllLoads_EmptyList() throws Exception {
        when(loadService.getAllLoads()).thenReturn(List.of());

        mockMvc.perform(get("/cargoRoute/loads/getAllLoads")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));

        verify(loadService, times(1)).getAllLoads();
    }

    @Test
    void testCreateLoad_Success() throws Exception {
        when(loadService.createLoad(any(LoadDTO.class))).thenReturn(loadDTO);

        mockMvc.perform(post("/cargoRoute/loads/createNewLoad")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loadDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.loadID").value(1L))
                .andExpect(jsonPath("$.loadCode").value("Pharma-001"));

        verify(loadService, times(1)).createLoad(any(LoadDTO.class));
    }

    @Test
    void testCreateLoad_WithNullFields() throws Exception {
        LoadDTO invalidDTO = new LoadDTO();
        invalidDTO.setLoadCode(null);
        invalidDTO.setStatus(null);

        when(loadService.createLoad(any(LoadDTO.class))).thenReturn(invalidDTO);

        mockMvc.perform(post("/cargoRoute/loads/createNewLoad")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidDTO)))
                .andExpect(status().isOk());

        verify(loadService, times(1)).createLoad(any(LoadDTO.class));
    }

    @Test
    void testUpdateLoad_Success() throws Exception {
        LoadDTO updateDTO = new LoadDTO();
        updateDTO.setStatus("DELIVERED");

        LoadDTO updatedDTO = new LoadDTO();
        updatedDTO.setLoadID(1L);
        updatedDTO.setLoadCode("Pharma-001");
        updatedDTO.setStatus("DELIVERED");

        when(loadService.updateLoad(eq(1L), any(LoadDTO.class))).thenReturn(updatedDTO);

        mockMvc.perform(put("/cargoRoute/loads/updateLoad/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.loadID").value(1L))
                .andExpect(jsonPath("$.status").value("DELIVERED"));

        verify(loadService, times(1)).updateLoad(eq(1L), any(LoadDTO.class));
    }

    @Test
    void testDeleteLoad_Success() throws Exception {
        doNothing().when(loadService).deleteLoad(1L);

        mockMvc.perform(delete("/cargoRoute/loads/deleteLoad/1")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNoContent());

        verify(loadService, times(1)).deleteLoad(1L);
    }

    @Test
    void testDeleteLoad_NonExistent() throws Exception {
        doNothing().when(loadService).deleteLoad(999L);

        mockMvc.perform(delete("/cargoRoute/loads/deleteLoad/999")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNoContent());

        verify(loadService, times(1)).deleteLoad(999L);
    }

    @Test
    void testCreateLoad_WithMultipleLoads() throws Exception {
        LoadDTO load2 = new LoadDTO();
        load2.setLoadID(2L);
        load2.setLoadCode("Electronics-001");
        load2.setStatus("PENDING");

        when(loadService.createLoad(any(LoadDTO.class)))
                .thenReturn(loadDTO)
                .thenReturn(load2);

        mockMvc.perform(post("/cargoRoute/loads/createNewLoad")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loadDTO)))
                .andExpect(status().isOk());

        mockMvc.perform(post("/cargoRoute/loads/createNewLoad")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(load2)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.loadID").value(2L));

        verify(loadService, times(2)).createLoad(any(LoadDTO.class));
    }

    @Test
    void testUpdateLoad_NonExistent() throws Exception {
        when(loadService.updateLoad(eq(999L), any(LoadDTO.class))).thenReturn(null);

        mockMvc.perform(put("/cargoRoute/loads/updateLoad/999")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loadDTO)))
                .andExpect(status().isOk());

        verify(loadService, times(1)).updateLoad(eq(999L), any(LoadDTO.class));
    }
}