package com.example.demo.controller;
 
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.example.demo.dto.KPIDTO;
import com.example.demo.exception.KPINotFoundException;
import com.example.demo.service.KPIService;
import com.fasterxml.jackson.databind.ObjectMapper;
 
@WebMvcTest(KPIController.class)
@DisplayName("KPIController Unit Tests")
class KPIControllerTest {
 
    @Autowired
    private MockMvc mockMvc;
 
    @MockBean
    private KPIService kpiService;
 
    @Autowired
    private ObjectMapper objectMapper;
 
    private KPIDTO kpiDTO;
 
    @BeforeEach
    void setUp() {
        kpiDTO = new KPIDTO();
        kpiDTO.setKpiID(1L);
        kpiDTO.setName("On-Time Delivery");
        kpiDTO.setDefinition("Percentage of deliveries on time");
        kpiDTO.setTarget(95.0);
        kpiDTO.setCurrentValue(88.5);
        kpiDTO.setReportingPeriod("Monthly");
    }
 
    // ─────────────────────────────────────────────────────────
    //  POST /kpis
    // ─────────────────────────────────────────────────────────
 
    @Test
    @DisplayName("POST /kpis - should create KPI and return 200 with saved DTO")
    void create_shouldReturn200WithSavedKPI() throws Exception {
        when(kpiService.save(any(KPIDTO.class))).thenReturn(kpiDTO);
 
        mockMvc.perform(post("/cargoRoute/kpis/create")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(kpiDTO)))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$.kpiID").value(1))
               .andExpect(jsonPath("$.name").value("On-Time Delivery"))
               .andExpect(jsonPath("$.target").value(95.0))
               .andExpect(jsonPath("$.currentValue").value(88.5))
               .andExpect(jsonPath("$.reportingPeriod").value("Monthly"));
 
        verify(kpiService, times(1)).save(any(KPIDTO.class));
    }
 
    @Test
    @DisplayName("POST /kpis - should return 400 when name is null (validation fails)")
    void create_shouldReturn400WhenNameIsNull() throws Exception {
        KPIDTO invalid = new KPIDTO();
        invalid.setTarget(95.0);
        invalid.setCurrentValue(88.5);
        // name is null → @NotNull should trigger 400
 
        mockMvc.perform(post("/cargoRoute/kpis/create")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalid)))
               .andExpect(status().isBadRequest());
 
        verify(kpiService, never()).save(any(KPIDTO.class));
    }
 
    @Test
    @DisplayName("POST /kpis - should return 400 when target is null (validation fails)")
    void create_shouldReturn400WhenTargetIsNull() throws Exception {
        KPIDTO invalid = new KPIDTO();
        invalid.setName("Fleet Utilization");
        invalid.setCurrentValue(70.0);
        // target is null → @NotNull should trigger 400
 
        mockMvc.perform(post("/cargoRoute/kpis/create")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalid)))
               .andExpect(status().isBadRequest());
 
        verify(kpiService, never()).save(any(KPIDTO.class));
    }
 
    // ─────────────────────────────────────────────────────────
    //  GET /kpis
    // ─────────────────────────────────────────────────────────
 
    @Test
    @DisplayName("GET /kpis - should return 200 with list of KPI DTOs")
    void getAll_shouldReturn200WithKPIList() throws Exception {
        KPIDTO second = new KPIDTO();
        second.setKpiID(2L);
        second.setName("Fleet Utilization");
        second.setTarget(80.0);
        second.setCurrentValue(75.0);
 
        when(kpiService.getAll()).thenReturn(List.of(kpiDTO, second));
 
        mockMvc.perform(get("/cargoRoute/kpis/getAll"))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$.length()").value(2))
               .andExpect(jsonPath("$[0].name").value("On-Time Delivery"))
               .andExpect(jsonPath("$[1].name").value("Fleet Utilization"));
 
        verify(kpiService, times(1)).getAll();
    }
 
    @Test
    @DisplayName("GET /kpis - should propagate KPINotFoundException when no KPIs exist")
    void getAll_shouldPropagateNotFoundExceptionWhenEmpty() throws Exception {
        when(kpiService.getAll()).thenThrow(new KPINotFoundException("No KPIs found"));
 
        mockMvc.perform(get("/cargoRoute/kpis/getAll"))
               .andExpect(status().isNotFound());
 
        verify(kpiService, times(1)).getAll();
    }
 
    // ─────────────────────────────────────────────────────────
    //  GET /kpis/{id}
    // ─────────────────────────────────────────────────────────
 
    @Test
    @DisplayName("GET /kpis/{id} - should return 200 with KPI DTO for valid id")
    void getById_shouldReturn200WithKPIDTO() throws Exception {
        when(kpiService.getById(1L)).thenReturn(kpiDTO);
 
        mockMvc.perform(get("/cargoRoute/kpis/getBy/1"))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$.kpiID").value(1))
               .andExpect(jsonPath("$.name").value("On-Time Delivery"))
               .andExpect(jsonPath("$.definition").value("Percentage of deliveries on time"));
 
        verify(kpiService, times(1)).getById(1L);
    }
 
    @Test
    @DisplayName("GET /kpis/{id} - should propagate KPINotFoundException when id not found")
    void getById_shouldPropagateNotFoundExceptionForMissingId() throws Exception {
        when(kpiService.getById(99L))
                .thenThrow(new KPINotFoundException("KPI not found with id: 99"));
 
        mockMvc.perform(get("/cargoRoute/kpis/getBy/99"))
               .andExpect(status().isNotFound());
 
        verify(kpiService, times(1)).getById(99L);
    }
 
    // ─────────────────────────────────────────────────────────
    //  DELETE /kpis/{id}
    // ─────────────────────────────────────────────────────────
 
    @Test
    @DisplayName("DELETE /kpis/{id} - should return 200 with success message when id exists")
    void delete_shouldReturn200WithMessageWhenDeleted() throws Exception {
        doNothing().when(kpiService).delete(1L);
 
        mockMvc.perform(delete("/cargoRoute/kpis/delete/1"))
               .andExpect(status().isOk())
               .andExpect(content().string("KPI deleted successfully"));
 
        verify(kpiService, times(1)).delete(1L);
    }
 
    @Test
    @DisplayName("DELETE /kpis/{id} - should propagate KPINotFoundException when id not found")
    void delete_shouldPropagateNotFoundExceptionForMissingId() throws Exception {
        doThrow(new KPINotFoundException("KPI not found with id: 99"))
                .when(kpiService).delete(99L);
 
        mockMvc.perform(delete("/cargoRoute/kpis/delete/99"))
               .andExpect(status().isNotFound());
 
        verify(kpiService, times(1)).delete(99L);
    }

    // ─────────────────────────────────────────────────────────
    //  PUT /kpis/{id}
    // ─────────────────────────────────────────────────────────

    @Test
    @DisplayName("PUT /kpis/{id} - should update KPI and return 200 with updated DTO")
    void update_shouldReturn200WithUpdatedKPI() throws Exception {
        KPIDTO updatedDTO = new KPIDTO();
        updatedDTO.setKpiID(1L);
        updatedDTO.setName("Updated Delivery Rate");
        updatedDTO.setDefinition("Updated definition");
        updatedDTO.setTarget(98.0);
        updatedDTO.setCurrentValue(91.0);
        updatedDTO.setReportingPeriod("Weekly");

        when(kpiService.update(eq(1L), any(KPIDTO.class))).thenReturn(updatedDTO);

        mockMvc.perform(put("/cargoRoute/kpis/update/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updatedDTO)))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$.kpiID").value(1))
               .andExpect(jsonPath("$.name").value("Updated Delivery Rate"))
               .andExpect(jsonPath("$.target").value(98.0))
               .andExpect(jsonPath("$.currentValue").value(91.0))
               .andExpect(jsonPath("$.reportingPeriod").value("Weekly"));

        verify(kpiService, times(1)).update(eq(1L), any(KPIDTO.class));
    }

    @Test
    @DisplayName("PUT /kpis/{id} - should return 404 when KPI id does not exist")
    void update_shouldReturn404WhenIdNotFound() throws Exception {
        when(kpiService.update(eq(99L), any(KPIDTO.class)))
                .thenThrow(new KPINotFoundException("KPI not found with id: 99"));

        mockMvc.perform(put("/cargoRoute/kpis/update/99")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(kpiDTO)))
               .andExpect(status().isNotFound());

        verify(kpiService, times(1)).update(eq(99L), any(KPIDTO.class));
    }

    @Test
    @DisplayName("PUT /kpis/{id} - should return 400 when name is null (validation fails)")
    void update_shouldReturn400WhenNameIsNull() throws Exception {
        KPIDTO invalid = new KPIDTO();
        invalid.setTarget(95.0);
        invalid.setCurrentValue(80.0);
        // name is null → @NotNull triggers 400

        mockMvc.perform(put("/cargoRoute/kpis/update/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalid)))
               .andExpect(status().isBadRequest());

        verify(kpiService, never()).update(anyLong(), any(KPIDTO.class));
    }

    @Test
    @DisplayName("PUT /kpis/{id} - should return 400 when target is negative (validation fails)")
    void update_shouldReturn400WhenTargetIsNegative() throws Exception {
        KPIDTO invalid = new KPIDTO();
        invalid.setName("Fleet KPI");
        invalid.setTarget(-5.0);   // @Positive triggers 400
        invalid.setCurrentValue(80.0);

        mockMvc.perform(put("/cargoRoute/kpis/update/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalid)))
               .andExpect(status().isBadRequest());

        verify(kpiService, never()).update(anyLong(), any(KPIDTO.class));
    }
}