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

import com.example.demo.dto.ReportDTO;
import com.example.demo.exception.ReportNotFoundException;
import com.example.demo.service.ReportService;
import com.fasterxml.jackson.databind.ObjectMapper;
 
@WebMvcTest(ReportController.class)

@DisplayName("ReportController Unit Tests")

class ReportControllerTest {
 
    @Autowired

    private MockMvc mockMvc;
 
    @MockBean

    private ReportService reportService;
    
    // Mock the other report services autowired into ReportController
    @MockBean
    private com.example.demo.service.OnTimeReportService onTimeReportService;

    @MockBean
    private com.example.demo.service.UtilizationReportService utilizationReportService;

    @MockBean
    private com.example.demo.service.RevenueReportService revenueReportService;

    @MockBean
    private com.example.demo.service.ExceptionReportService exceptionReportService;
 
    @Autowired

    private ObjectMapper objectMapper;
 
    private ReportDTO reportDTO;
 
    @BeforeEach

    void setUp() {

        reportDTO = new ReportDTO();

        reportDTO.setReportID(1L);

        reportDTO.setScope("REVENUE");

        reportDTO.setParametersJSON("{\"region\":\"North\"}");

        reportDTO.setMetricsJSON("{\"total\":5000}");

        reportDTO.setGeneratedBy("admin");

        reportDTO.setGeneratedAt("2026-04-10T09:00");

    }
 
    // ─────────────────────────────────────────────────────────

    //  POST /reports

    // ─────────────────────────────────────────────────────────
 
    @Test

    @DisplayName("POST /reports - should create report and return 200 with saved DTO")

    void create_shouldReturn200WithSavedReport() throws Exception {

        when(reportService.save(any(ReportDTO.class))).thenReturn(reportDTO);
 
        mockMvc.perform(post("/cargoRoute/reports/create")

                .contentType(MediaType.APPLICATION_JSON)

                .content(objectMapper.writeValueAsString(reportDTO)))

               .andExpect(status().isOk())
               .andExpect(jsonPath("$.reportID").value(1))
               .andExpect(jsonPath("$.scope").value("REVENUE"))
               .andExpect(jsonPath("$.generatedBy").value("admin"));
 
        verify(reportService, times(1)).save(any(ReportDTO.class));

    }
 
    @Test

    @DisplayName("POST /reports - should return 400 when scope is null (validation fails)")

    void create_shouldReturn400WhenScopeIsNull() throws Exception {

        ReportDTO invalid = new ReportDTO();

        invalid.setGeneratedBy("admin");

        // scope is null → @NotNull should trigger 400
 
        mockMvc.perform(post("/cargoRoute/reports/create")

                .contentType(MediaType.APPLICATION_JSON)

                .content(objectMapper.writeValueAsString(invalid)))

               .andExpect(status().isBadRequest());
 
        verify(reportService, never()).save(any(ReportDTO.class));

    }
 
    @Test

    @DisplayName("POST /reports - should return 400 when scope exceeds max length")

    void create_shouldReturn400WhenScopeExceedsMaxLength() throws Exception {

        ReportDTO invalid = new ReportDTO();

        invalid.setScope("A".repeat(51)); // exceeds @Size(max=50)

        invalid.setGeneratedBy("admin");
 
        mockMvc.perform(post("/cargoRoute/reports/create")

                .contentType(MediaType.APPLICATION_JSON)

                .content(objectMapper.writeValueAsString(invalid)))

               .andExpect(status().isBadRequest());
 
        verify(reportService, never()).save(any(ReportDTO.class));

    }
 
    // ─────────────────────────────────────────────────────────

    //  GET /reports

    // ─────────────────────────────────────────────────────────
 
    @Test

    @DisplayName("GET /reports - should return 200 with list of report DTOs")

    void getAll_shouldReturn200WithReportList() throws Exception {

        ReportDTO second = new ReportDTO();

        second.setReportID(2L);

        second.setScope("UTILIZATION");

        second.setGeneratedBy("system");
 
        when(reportService.getAll()).thenReturn(List.of(reportDTO, second));
 
        mockMvc.perform(get("/cargoRoute/reports/getAll"))

               .andExpect(status().isOk())

               .andExpect(jsonPath("$.length()").value(2))

               .andExpect(jsonPath("$[0].scope").value("REVENUE"))

               .andExpect(jsonPath("$[1].scope").value("UTILIZATION"));
 
        verify(reportService, times(1)).getAll();

    }
 
    @Test

    @DisplayName("GET /reports - should propagate ReportNotFoundException when no reports exist")

    void getAll_shouldPropagateNotFoundExceptionWhenEmpty() throws Exception {

        when(reportService.getAll())

                .thenThrow(new ReportNotFoundException("No reports found"));
 
        mockMvc.perform(get("/cargoRoute/reports/getAll"))

               .andExpect(status().isNotFound());
 
        verify(reportService, times(1)).getAll();

    }
 
    // ─────────────────────────────────────────────────────────

    //  GET /reports/{id}

    // ─────────────────────────────────────────────────────────
 
    @Test

    @DisplayName("GET /reports/{id} - should return 200 with ReportDTO for valid id")

    void getById_shouldReturn200WithReportDTO() throws Exception {

        when(reportService.getById(1L)).thenReturn(reportDTO);
 
        mockMvc.perform(get("/cargoRoute/reports/getBy/1"))

               .andExpect(status().isOk())

               .andExpect(jsonPath("$.reportID").value(1))

               .andExpect(jsonPath("$.scope").value("REVENUE"))

               .andExpect(jsonPath("$.parametersJSON").value("{\"region\":\"North\"}"))

               .andExpect(jsonPath("$.metricsJSON").value("{\"total\":5000}"));
 
        verify(reportService, times(1)).getById(1L);

    }
 
    @Test

    @DisplayName("GET /reports/{id} - should propagate ReportNotFoundException when id not found")

    void getById_shouldPropagateNotFoundExceptionForMissingId() throws Exception {

        when(reportService.getById(99L))

                .thenThrow(new ReportNotFoundException("Report not found with id: 99"));
 
        mockMvc.perform(get("/cargoRoute/reports/getBy/99"))

               .andExpect(status().isNotFound());
 
        verify(reportService, times(1)).getById(99L);

    }
 
    @Test

    @DisplayName("GET /reports/{id} - should return generatedAt field in response")

    void getById_shouldReturnGeneratedAtField() throws Exception {

        when(reportService.getById(1L)).thenReturn(reportDTO);
 
        mockMvc.perform(get("/cargoRoute/reports/getBy/1"))

               .andExpect(status().isOk())

               .andExpect(jsonPath("$.generatedAt").value("2026-04-10T09:00"));
 
        verify(reportService, times(1)).getById(1L);

    }
 
    // ─────────────────────────────────────────────────────────

    //  DELETE /reports/{id}

    // ─────────────────────────────────────────────────────────
 
    @Test

    @DisplayName("DELETE /reports/{id} - should return 200 with success message when id exists")

    void delete_shouldReturn200WithMessageWhenDeleted() throws Exception {

        doNothing().when(reportService).delete(1L);
 
        mockMvc.perform(delete("/cargoRoute/reports/delete/1"))

               .andExpect(status().isOk())

               .andExpect(content().string("Report deleted successfully"));
 
        verify(reportService, times(1)).delete(1L);

    }
 
    @Test

    @DisplayName("DELETE /reports/{id} - should propagate ReportNotFoundException when id not found")

    void delete_shouldPropagateNotFoundExceptionForMissingId() throws Exception {

        doThrow(new ReportNotFoundException("Report not found with id: 99"))

                .when(reportService).delete(99L);
 
        mockMvc.perform(delete("/cargoRoute/reports/delete/99"))

               .andExpect(status().isNotFound());
 
        verify(reportService, times(1)).delete(99L);

    }

    // ─────────────────────────────────────────────────────────
    //  PUT /reports/{id}
    // ─────────────────────────────────────────────────────────

    @Test
    @DisplayName("PUT /reports/{id} - should update report and return 200 with updated DTO")
    void update_shouldReturn200WithUpdatedReport() throws Exception {
        ReportDTO updatedDTO = new ReportDTO();
        updatedDTO.setReportID(1L);
        updatedDTO.setScope("UTILIZATION");
        updatedDTO.setParametersJSON("{\"fleet\":\"all\"}");
        updatedDTO.setMetricsJSON("{\"utilization\":92.5}");
        updatedDTO.setGeneratedBy("supervisor");
        updatedDTO.setGeneratedAt("2026-04-13T10:00");

        when(reportService.update(eq(1L), any(ReportDTO.class))).thenReturn(updatedDTO);

        mockMvc.perform(put("/cargoRoute/reports/update/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updatedDTO)))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$.reportID").value(1))
               .andExpect(jsonPath("$.scope").value("UTILIZATION"))
               .andExpect(jsonPath("$.generatedBy").value("supervisor"));

        verify(reportService, times(1)).update(eq(1L), any(ReportDTO.class));
    }

    @Test
    @DisplayName("PUT /reports/{id} - should return 404 when report id does not exist")
    void update_shouldReturn404WhenIdNotFound() throws Exception {
        when(reportService.update(eq(99L), any(ReportDTO.class)))
                .thenThrow(new ReportNotFoundException("Report not found with id: 99"));

        mockMvc.perform(put("/cargoRoute/reports/update/99")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(reportDTO)))
               .andExpect(status().isNotFound());

        verify(reportService, times(1)).update(eq(99L), any(ReportDTO.class));
    }

    @Test
    @DisplayName("PUT /reports/{id} - should return 400 when scope is null (validation fails)")
    void update_shouldReturn400WhenScopeIsNull() throws Exception {
        ReportDTO invalid = new ReportDTO();
        invalid.setGeneratedBy("admin");
        // scope is null → @NotNull triggers 400

        mockMvc.perform(put("/cargoRoute/reports/update/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalid)))
               .andExpect(status().isBadRequest());

        verify(reportService, never()).update(anyLong(), any(ReportDTO.class));
    }

    @Test
    @DisplayName("PUT /reports/{id} - should return 400 when scope exceeds max length")
    void update_shouldReturn400WhenScopeExceedsMaxLength() throws Exception {
        ReportDTO invalid = new ReportDTO();
        invalid.setScope("A".repeat(51)); // @Size(max=50) triggers 400
        invalid.setGeneratedBy("admin");

        mockMvc.perform(put("/cargoRoute/reports/update/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalid)))
               .andExpect(status().isBadRequest());

        verify(reportService, never()).update(anyLong(), any(ReportDTO.class));
    }
}