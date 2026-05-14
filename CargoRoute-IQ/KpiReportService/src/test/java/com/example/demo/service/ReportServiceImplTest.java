package com.example.demo.service;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import com.example.demo.dto.ReportDTO;
import com.example.demo.entity.Report;
import com.example.demo.enums.ReportScope;
import com.example.demo.exception.ReportNotFoundException;
import com.example.demo.repo.ReportRepo;
import com.example.demo.serviceImpl.ReportServiceImpl;

@ExtendWith(MockitoExtension.class)
class ReportServiceImplTest {

    @Mock
    private ReportRepo reportRepo;

    @InjectMocks
    private ReportServiceImpl reportService;

    private Report reportEntity;
    private ReportDTO reportDTO;

    @BeforeEach
    void setUp() {
        reportEntity = new Report();
        reportEntity.setReportID(1L);
        reportEntity.setScope(ReportScope.REVENUE);
        reportEntity.setParametersJSON("{\"region\":\"North\"}");
        reportEntity.setMetricsJSON("{\"total\":5000}");
        reportEntity.setGeneratedBy("admin");
        reportEntity.setGeneratedAt(LocalDateTime.of(2026, 4, 10, 10, 0));

        reportDTO = new ReportDTO();
        reportDTO.setReportID(1L);
        reportDTO.setScope("REVENUE");
        reportDTO.setParametersJSON("{\"region\":\"North\"}");
        reportDTO.setMetricsJSON("{\"total\":5000}");
        reportDTO.setGeneratedBy("admin");
        reportDTO.setGeneratedAt("2026-04-10T10:00");
    }

    // ==================== SAVE ====================

    @Test
    @DisplayName("save() - should save report and return DTO")
    void save_shouldSaveAndReturnDTO() {
        when(reportRepo.save(any(Report.class))).thenReturn(reportEntity);

        ReportDTO result = reportService.save(reportDTO);

        assertThat(result).isNotNull();
        assertThat(result.getReportID()).isEqualTo(1L);
        assertThat(result.getScope()).isEqualTo("REVENUE");
        assertThat(result.getParametersJSON()).isEqualTo("{\"region\":\"North\"}");
        assertThat(result.getMetricsJSON()).isEqualTo("{\"total\":5000}");
        assertThat(result.getGeneratedBy()).isEqualTo("admin");

        verify(reportRepo, times(1)).save(any(Report.class));
    }

    @Test
    @DisplayName("save() - should return null when null DTO is passed")
    void save_withNullDTO_shouldReturnNull() {
        when(reportRepo.save(null)).thenReturn(null);

        ReportDTO result = reportService.save(null);

        assertThat(result).isNull();
    }

    @Test
    @DisplayName("save() - should handle all ReportScope values")
    void save_withDifferentScopes_shouldHandleAllScopes() {
        for (ReportScope scope : ReportScope.values()) {
            reportEntity.setScope(scope);
            reportDTO.setScope(scope.name());

            when(reportRepo.save(any(Report.class))).thenReturn(reportEntity);

            ReportDTO result = reportService.save(reportDTO);

            assertThat(result).isNotNull();
            assertThat(result.getScope()).isEqualTo(scope.name());
        }
    }

    // ==================== GET ALL ====================

    @Test
    @DisplayName("getAll() - should return list of report DTOs")
    void getAll_shouldReturnListOfDTOs() {
        Report report2 = new Report();
        report2.setReportID(2L);
        report2.setScope(ReportScope.ONTIME);
        report2.setGeneratedBy("scheduler");
        report2.setGeneratedAt(LocalDateTime.now());

        when(reportRepo.findAll()).thenReturn(List.of(reportEntity, report2));

        List<ReportDTO> result = reportService.getAll();

        assertThat(result).isNotNull().hasSize(2);
        assertThat(result.get(0).getReportID()).isEqualTo(1L);
        assertThat(result.get(0).getScope()).isEqualTo("REVENUE");
        assertThat(result.get(1).getReportID()).isEqualTo(2L);
        assertThat(result.get(1).getScope()).isEqualTo("ONTIME");

        verify(reportRepo, times(1)).findAll();
    }

    @Test
    @DisplayName("getAll() - should throw ReportNotFoundException when no reports exist")
    void getAll_whenEmpty_shouldThrowReportNotFoundException() {
        when(reportRepo.findAll()).thenReturn(Collections.emptyList());

        assertThatThrownBy(() -> reportService.getAll())
                .isInstanceOf(ReportNotFoundException.class)
                .hasMessage("No reports found");

        verify(reportRepo, times(1)).findAll();
    }

    // ==================== GET BY ID ====================

    @Test
    @DisplayName("getById() - should return report DTO for valid ID")
    void getById_withValidId_shouldReturnDTO() {
        when(reportRepo.findById(1L)).thenReturn(Optional.of(reportEntity));

        ReportDTO result = reportService.getById(1L);

        assertThat(result).isNotNull();
        assertThat(result.getReportID()).isEqualTo(1L);
        assertThat(result.getScope()).isEqualTo("REVENUE");
        assertThat(result.getParametersJSON()).isEqualTo("{\"region\":\"North\"}");
        assertThat(result.getGeneratedBy()).isEqualTo("admin");
        assertThat(result.getGeneratedAt()).isNotNull();

        verify(reportRepo, times(1)).findById(1L);
    }

    @Test
    @DisplayName("getById() - should throw ReportNotFoundException for non-existent ID")
    void getById_withInvalidId_shouldThrowReportNotFoundException() {
        when(reportRepo.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> reportService.getById(99L))
                .isInstanceOf(ReportNotFoundException.class)
                .hasMessage("Report not found with id: 99");

        verify(reportRepo, times(1)).findById(99L);
    }

    @Test
    @DisplayName("getById() - should map generatedAt field to string correctly")
    void getById_shouldMapGeneratedAtToString() {
        LocalDateTime fixedTime = LocalDateTime.of(2026, 4, 10, 10, 0, 0);
        reportEntity.setGeneratedAt(fixedTime);

        when(reportRepo.findById(1L)).thenReturn(Optional.of(reportEntity));

        ReportDTO result = reportService.getById(1L);

        assertThat(result.getGeneratedAt()).isEqualTo(fixedTime.toString());
    }

    @Test
    @DisplayName("getById() - should set generatedAt to null when entity has null generatedAt")
    void getById_withNullGeneratedAt_shouldReturnNullGeneratedAt() {
        reportEntity.setGeneratedAt(null);

        when(reportRepo.findById(1L)).thenReturn(Optional.of(reportEntity));

        ReportDTO result = reportService.getById(1L);

        assertThat(result.getGeneratedAt()).isNull();
    }

    // ==================== DELETE ====================

    @Test
    @DisplayName("delete() - should delete report when ID exists")
    void delete_withValidId_shouldDeleteSuccessfully() {
        when(reportRepo.existsById(1L)).thenReturn(true);
        doNothing().when(reportRepo).deleteById(1L);

        assertThatCode(() -> reportService.delete(1L)).doesNotThrowAnyException();

        verify(reportRepo, times(1)).existsById(1L);
        verify(reportRepo, times(1)).deleteById(1L);
    }

    @Test
    @DisplayName("delete() - should throw ReportNotFoundException when ID does not exist")
    void delete_withInvalidId_shouldThrowReportNotFoundException() {
        when(reportRepo.existsById(99L)).thenReturn(false);

        assertThatThrownBy(() -> reportService.delete(99L))
                .isInstanceOf(ReportNotFoundException.class)
                .hasMessage("Report not found with id: 99");

        verify(reportRepo, times(1)).existsById(99L);
        verify(reportRepo, never()).deleteById(anyLong());
    }
}
