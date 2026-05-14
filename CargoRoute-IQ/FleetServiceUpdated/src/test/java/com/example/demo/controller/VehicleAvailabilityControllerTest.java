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

import com.example.demo.entity.VehicleAvailability;
import com.example.demo.service.VehicleAvailabilityService;
import com.fasterxml.jackson.databind.ObjectMapper;

@WebMvcTest(VehicleAvailabilityController.class)
@ExtendWith(MockitoExtension.class)
class VehicleAvailabilityControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Mock
    private VehicleAvailabilityService service;

    @Autowired
    private ObjectMapper objectMapper;

    private VehicleAvailability availability;

    @BeforeEach
    void setUp() {
        availability = new VehicleAvailability();
        availability.setAvailID(1L);
        availability.setDate(LocalDateTime.of(2026, 4, 11, 0, 0));
        availability.setStartTime(LocalDateTime.of(2026, 4, 11, 8, 0));
        availability.setEndTime(LocalDateTime.of(2026, 4, 11, 18, 0));
        availability.setReasonNote("Maintenance window");
        availability.setStatus("OPEN");
    }

    @Test
    void testCreate_Success() throws Exception {
        when(service.save(any(VehicleAvailability.class))).thenReturn(availability);

        mockMvc.perform(post("/cargoRoute/vehicleAvailability/createNewVehicleAvailability")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(availability)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.availID").value(1L))
                .andExpect(jsonPath("$.status").value("OPEN"))
                .andExpect(jsonPath("$.reasonNote").value("Maintenance window"));

        verify(service, times(1)).save(any(VehicleAvailability.class));
    }

    @Test
    void testCreate_InvalidData() throws Exception {
        VehicleAvailability invalid = new VehicleAvailability();
        when(service.save(any(VehicleAvailability.class))).thenReturn(invalid);

        mockMvc.perform(post("/cargoRoute/vehicleAvailability/createNewVehicleAvailability")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalid)))
                .andExpect(status().isOk());

        verify(service, times(1)).save(any(VehicleAvailability.class));
    }

    @Test
    void testGetAll_Success() throws Exception {
        VehicleAvailability availability2 = new VehicleAvailability();
        availability2.setAvailID(2L);
        availability2.setStatus("CLOSED");

        when(service.getAll()).thenReturn(List.of(availability, availability2));

        mockMvc.perform(get("/cargoRoute/vehicleAvailability/getAllVehicleAvailabilities")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].availID").value(1L))
                .andExpect(jsonPath("$[1].availID").value(2L))
                .andExpect(jsonPath("$.length()").value(2));

        verify(service, times(1)).getAll();
    }

    @Test
    void testGetAll_EmptyList() throws Exception {
        when(service.getAll()).thenReturn(List.of());

        mockMvc.perform(get("/cargoRoute/vehicleAvailability/getAllVehicleAvailabilities")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));

        verify(service, times(1)).getAll();
    }

    @Test
    void testGetById_Success() throws Exception {
        when(service.getById(1L)).thenReturn(availability);

        mockMvc.perform(get("/cargoRoute/vehicleAvailability/getVehicleAvailability/1")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.availID").value(1L))
                .andExpect(jsonPath("$.status").value("OPEN"));

        verify(service, times(1)).getById(1L);
    }

    @Test
    void testGetById_NotFound() throws Exception {
        when(service.getById(999L)).thenReturn(null);

        mockMvc.perform(get("/cargoRoute/vehicleAvailability/getVehicleAvailability/999")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());

        verify(service, times(1)).getById(999L);
    }

    @Test
    void testGetByVehicleId_Success() throws Exception {
        when(service.getByVehicleId(10L)).thenReturn(List.of(availability));

        mockMvc.perform(get("/cargoRoute/vehicleAvailability/vehicle/10")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].availID").value(1L))
                .andExpect(jsonPath("$.length()").value(1));

        verify(service, times(1)).getByVehicleId(10L);
    }

    @Test
    void testGetByVehicleId_NoResults() throws Exception {
        when(service.getByVehicleId(999L)).thenReturn(List.of());

        mockMvc.perform(get("/cargoRoute/vehicleAvailability/vehicle/999")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));

        verify(service, times(1)).getByVehicleId(999L);
    }

    @Test
    void testUpdate_Success() throws Exception {
        VehicleAvailability updatedAvailability = new VehicleAvailability();
        updatedAvailability.setAvailID(1L);
        updatedAvailability.setStatus("CLOSED");
        updatedAvailability.setReasonNote("Updated reason");

        when(service.update(eq(1L), any(VehicleAvailability.class))).thenReturn(updatedAvailability);

        mockMvc.perform(put("/cargoRoute/vehicleAvailability/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updatedAvailability)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.availID").value(1L))
                .andExpect(jsonPath("$.status").value("CLOSED"))
                .andExpect(jsonPath("$.reasonNote").value("Updated reason"));

        verify(service, times(1)).update(eq(1L), any(VehicleAvailability.class));
    }

    @Test
    void testUpdate_NotFound() throws Exception {
        when(service.update(eq(999L), any(VehicleAvailability.class))).thenReturn(null);

        mockMvc.perform(put("/cargoRoute/vehicleAvailability/999")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(availability)))
                .andExpect(status().isOk());

        verify(service, times(1)).update(eq(999L), any(VehicleAvailability.class));
    }

    @Test
    void testDelete_Success() throws Exception {
        doNothing().when(service).delete(1L);

        mockMvc.perform(delete("/cargoRoute/vehicleAvailability/1")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());

        verify(service, times(1)).delete(1L);
    }

    @Test
    void testDelete_NonExistent() throws Exception {
        doNothing().when(service).delete(999L);

        mockMvc.perform(delete("/cargoRoute/vehicleAvailability/999")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());

        verify(service, times(1)).delete(999L);
    }
}
