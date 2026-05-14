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

import com.example.demo.dto.RouteDTO;
import com.example.demo.service.RouteService;
import com.fasterxml.jackson.databind.ObjectMapper;

@WebMvcTest(RouteController.class)
@ExtendWith(MockitoExtension.class)
class RouteControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Mock
    private RouteService routeService;

    @Autowired
    private ObjectMapper objectMapper;

    private RouteDTO routeDTO;

    @BeforeEach
    void setUp() {
        routeDTO = new RouteDTO();
        routeDTO.setRouteID(1L);
        routeDTO.setStatus("ACTIVE");
        routeDTO.setDistanceKm(100.5);          // corrected field
        routeDTO.setEstimatedDurationMin(150);  // corrected field (2.5 hours = 150 minutes)
    }

    @Test
    void testGetRouteById_Success() throws Exception {
        when(routeService.getRouteById(1L)).thenReturn(routeDTO);

        mockMvc.perform(get("/cargoRoute/routes/getRoute/1")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.routeID").value(1L))
                .andExpect(jsonPath("$.status").value("ACTIVE"))
                .andExpect(jsonPath("$.distanceKm").value(100.5));

        verify(routeService, times(1)).getRouteById(1L);
    }

    @Test
    void testGetRouteById_NotFound() throws Exception {
        when(routeService.getRouteById(999L)).thenReturn(null);

        mockMvc.perform(get("/cargoRoute/routes/getRoute/999")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());

        verify(routeService, times(1)).getRouteById(999L);
    }

    @Test
    void testGetAllRoutes_Success() throws Exception {
        RouteDTO route2 = new RouteDTO();
        route2.setRouteID(2L);
        route2.setStatus("INACTIVE");

        when(routeService.getAllRoutes()).thenReturn(List.of(routeDTO, route2));

        mockMvc.perform(get("/cargoRoute/routes/getAllRoutes")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].routeID").value(1L))
                .andExpect(jsonPath("$[1].routeID").value(2L))
                .andExpect(jsonPath("$.length()").value(2));

        verify(routeService, times(1)).getAllRoutes();
    }

    @Test
    void testGetAllRoutes_EmptyList() throws Exception {
        when(routeService.getAllRoutes()).thenReturn(List.of());

        mockMvc.perform(get("/cargoRoute/routes/getAllRoutes")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));

        verify(routeService, times(1)).getAllRoutes();
    }

    @Test
    void testCreateRoute_Success() throws Exception {
        when(routeService.createRoute(any(RouteDTO.class))).thenReturn(routeDTO);

        mockMvc.perform(post("/cargoRoute/routes/createNewRoute")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(routeDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.routeID").value(1L))
                .andExpect(jsonPath("$.status").value("ACTIVE"));

        verify(routeService, times(1)).createRoute(any(RouteDTO.class));
    }

    @Test
    void testCreateRoute_WithNullFields() throws Exception {
        RouteDTO invalidDTO = new RouteDTO();
        invalidDTO.setStatus(null);

        when(routeService.createRoute(any(RouteDTO.class))).thenReturn(invalidDTO);

        mockMvc.perform(post("/cargoRoute/routes/createNewRoute")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidDTO)))
                .andExpect(status().isOk());

        verify(routeService, times(1)).createRoute(any(RouteDTO.class));
    }

    @Test
    void testUpdateRoute_Success() throws Exception {
        RouteDTO updateDTO = new RouteDTO();
        updateDTO.setStatus("COMPLETED");
        updateDTO.setDistanceKm(150.0);

        RouteDTO updatedDTO = new RouteDTO();
        updatedDTO.setRouteID(1L);
        updatedDTO.setStatus("COMPLETED");
        updatedDTO.setDistanceKm(150.0);

        when(routeService.updateRoute(eq(1L), any(RouteDTO.class))).thenReturn(updatedDTO);

        mockMvc.perform(put("/cargoRoute/routes/updateRoute/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.routeID").value(1L))
                .andExpect(jsonPath("$.status").value("COMPLETED"))
                .andExpect(jsonPath("$.distanceKm").value(150.0));

        verify(routeService, times(1)).updateRoute(eq(1L), any(RouteDTO.class));
    }

    @Test
    void testDeleteRoute_Success() throws Exception {
        doNothing().when(routeService).deleteRoute(1L);

        mockMvc.perform(delete("/cargoRoute/routes/deleteRoute/1")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNoContent());

        verify(routeService, times(1)).deleteRoute(1L);
    }

    @Test
    void testDeleteRoute_NonExistent() throws Exception {
        doNothing().when(routeService).deleteRoute(999L);

        mockMvc.perform(delete("/cargoRoute/routes/deleteRoute/999")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNoContent());

        verify(routeService, times(1)).deleteRoute(999L);
    }

    @Test
    void testGetRoutesByVehicleId_Success() throws Exception {
        when(routeService.getRoutesByVehicleId(10L)).thenReturn(List.of(routeDTO));

        mockMvc.perform(get("/cargoRoute/routes/vehicle/10")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].routeID").value(1L))
                .andExpect(jsonPath("$.length()").value(1));

        verify(routeService, times(1)).getRoutesByVehicleId(10L);
    }

    @Test
    void testGetRoutesByVehicleId_NoResults() throws Exception {
        when(routeService.getRoutesByVehicleId(999L)).thenReturn(List.of());

        mockMvc.perform(get("/cargoRoute/routes/vehicle/999")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));

        verify(routeService, times(1)).getRoutesByVehicleId(999L);
    }

    @Test
    void testGetRoutesByLoadId_Success() throws Exception {
        when(routeService.getRoutesByLoadId(20L)).thenReturn(List.of(routeDTO));

        mockMvc.perform(get("/cargoRoute/routes/load/20")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].routeID").value(1L))
                .andExpect(jsonPath("$.length()").value(1));

        verify(routeService, times(1)).getRoutesByLoadId(20L);
    }

    @Test
    void testGetRoutesByLoadId_NoResults() throws Exception {
        when(routeService.getRoutesByLoadId(999L)).thenReturn(List.of());

        mockMvc.perform(get("/cargoRoute/routes/load/999")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));

        verify(routeService, times(1)).getRoutesByLoadId(999L);
    }
}