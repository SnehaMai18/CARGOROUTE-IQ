package com.example.demo.controller;

import static org.junit.jupiter.api.Assertions.*;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.time.LocalDateTime;
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

import com.example.demo.dto.VehicleDTO;
import com.example.demo.entity.enums.VehicleType;
import com.example.demo.service.VehicleService;
import com.fasterxml.jackson.databind.ObjectMapper;

@WebMvcTest(VehicleController.class)
@ExtendWith(MockitoExtension.class)
class VehicleControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Mock
    private VehicleService vehicleService;

    @Autowired
    private ObjectMapper objectMapper;

    private VehicleDTO vehicleDTO;

    @BeforeEach
    void setUp() {
        vehicleDTO = new VehicleDTO();
        vehicleDTO.setVehicleID(1L);
        vehicleDTO.setRegNumber("ABC-123");
        vehicleDTO.setType(VehicleType.TRUCK);
        vehicleDTO.setMaxWeightKg(12000.0);
        vehicleDTO.setMaxVolumeM3(40.0);
        vehicleDTO.setStatus("AVAILABLE");
        vehicleDTO.setLastMaintenanceAt(LocalDateTime.of(2026, 4, 10, 10, 0));
    }

    @Test
    void testCreateVehicle_Success() throws Exception {
        when(vehicleService.createVehicle(any(VehicleDTO.class))).thenReturn(vehicleDTO);

        mockMvc.perform(post("/cargoRoute/vehicles/createNewVehicle")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(vehicleDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.vehicleID").value(1L))
                .andExpect(jsonPath("$.regNumber").value("ABC-123"))
                .andExpect(jsonPath("$.type").value("TRUCK"))
                .andExpect(jsonPath("$.status").value("AVAILABLE"));

        verify(vehicleService, times(1)).createVehicle(any(VehicleDTO.class));
    }

    @Test
    void testCreateVehicle_WithNullFields() throws Exception {
        VehicleDTO invalidDTO = new VehicleDTO();
        invalidDTO.setRegNumber(null);
        invalidDTO.setType(null);

        mockMvc.perform(post("/cargoRoute/vehicles/createNewVehicle")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidDTO)))
                .andExpect(status().isOk());

        verify(vehicleService, times(1)).createVehicle(any(VehicleDTO.class));
    }

    @Test
    void testGetAllVehicles_Success() throws Exception {
        VehicleDTO vehicle2 = new VehicleDTO();
        vehicle2.setVehicleID(2L);
        vehicle2.setRegNumber("XYZ-789");
        vehicle2.setType(VehicleType.VAN);
        vehicle2.setStatus("IN_SERVICE");

        when(vehicleService.getAllVehicles()).thenReturn(List.of(vehicleDTO, vehicle2));

        mockMvc.perform(get("/cargoRoute/vehicles/getAllVehicles")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].vehicleID").value(1L))
                .andExpect(jsonPath("$[1].vehicleID").value(2L))
                .andExpect(jsonPath("$.length()").value(2));

        verify(vehicleService, times(1)).getAllVehicles();
    }

    @Test
    void testGetAllVehicles_EmptyList() throws Exception {
        when(vehicleService.getAllVehicles()).thenReturn(List.of());

        mockMvc.perform(get("/cargoRoute/vehicles/getAllVehicles")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));

        verify(vehicleService, times(1)).getAllVehicles();
    }

    @Test
    void testGetVehicleById_Success() throws Exception {
        when(vehicleService.getVehicleById(1L)).thenReturn(vehicleDTO);

        mockMvc.perform(get("/cargoRoute/vehicles/getVehicle/1")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.vehicleID").value(1L))
                .andExpect(jsonPath("$.regNumber").value("ABC-123"));

        verify(vehicleService, times(1)).getVehicleById(1L);
    }

    @Test
    void testGetVehicleById_NotFound() throws Exception {
        when(vehicleService.getVehicleById(999L)).thenReturn(null);

        mockMvc.perform(get("/cargoRoute/vehicles/getVehicle/999")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());

        verify(vehicleService, times(1)).getVehicleById(999L);
    }

    @Test
    void testUpdateVehicle_Success() throws Exception {
        VehicleDTO updateDTO = new VehicleDTO();
        updateDTO.setRegNumber("ABC-999");
        updateDTO.setStatus("MAINTENANCE");

        VehicleDTO updatedDTO = new VehicleDTO();
        updatedDTO.setVehicleID(1L);
        updatedDTO.setRegNumber("ABC-999");
        updatedDTO.setType(VehicleType.TRUCK);
        updatedDTO.setStatus("MAINTENANCE");

        when(vehicleService.updateVehicle(eq(1L), any(VehicleDTO.class))).thenReturn(updatedDTO);

        mockMvc.perform(put("/cargoRoute/vehicles/updateVehicle/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.vehicleID").value(1L))
                .andExpect(jsonPath("$.regNumber").value("ABC-999"))
                .andExpect(jsonPath("$.status").value("MAINTENANCE"));

        verify(vehicleService, times(1)).updateVehicle(eq(1L), any(VehicleDTO.class));
    }

    @Test
    void testDeleteVehicle_Success() throws Exception {
        doNothing().when(vehicleService).deleteVehicle(1L);

        mockMvc.perform(delete("/cargoRoute/vehicles/deleteVehicle/1")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());

        verify(vehicleService, times(1)).deleteVehicle(1L);
    }

    @Test
    void testDeleteVehicle_NonExistent() throws Exception {
        doNothing().when(vehicleService).deleteVehicle(999L);

        mockMvc.perform(delete("/cargoRoute/vehicles/deleteVehicle/999")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());

        verify(vehicleService, times(1)).deleteVehicle(999L);
    }
}
