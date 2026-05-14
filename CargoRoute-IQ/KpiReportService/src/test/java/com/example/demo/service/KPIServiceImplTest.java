package com.example.demo.service;

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

import com.example.demo.dto.KPIDTO;
import com.example.demo.entity.KPI;
import com.example.demo.exception.KPINotFoundException;
import com.example.demo.repo.KPIRepo;
import com.example.demo.serviceImpl.KPIServiceimpl;

@ExtendWith(MockitoExtension.class)
class KPIServiceImplTest {

    @Mock
    private KPIRepo kpiRepo;

    @InjectMocks
    private KPIServiceimpl kpiService;

    private KPI kpiEntity;
    private KPIDTO kpiDTO;

    @BeforeEach
    void setUp() {
        kpiEntity = new KPI();
        kpiEntity.setKPIID(1L);
        kpiEntity.setName("Revenue Growth");
        kpiEntity.setDefinition("Measures monthly revenue growth");
        kpiEntity.setTarget(100.0);
        kpiEntity.setCurrentValue(85.0);
        kpiEntity.setReportingPeriod("Monthly");

        kpiDTO = new KPIDTO();
        kpiDTO.setKpiID(1L);
        kpiDTO.setName("Revenue Growth");
        kpiDTO.setDefinition("Measures monthly revenue growth");
        kpiDTO.setTarget(100.0);
        kpiDTO.setCurrentValue(85.0);
        kpiDTO.setReportingPeriod("Monthly");
    }

    // ==================== SAVE ====================

    @Test
    @DisplayName("save() - should save KPI and return DTO")
    void save_shouldSaveAndReturnDTO() {
        when(kpiRepo.save(any(KPI.class))).thenReturn(kpiEntity);

        KPIDTO result = kpiService.save(kpiDTO);

        assertThat(result).isNotNull();
        assertThat(result.getKpiID()).isEqualTo(1L);
        assertThat(result.getName()).isEqualTo("Revenue Growth");
        assertThat(result.getTarget()).isEqualTo(100.0);
        assertThat(result.getCurrentValue()).isEqualTo(85.0);
        assertThat(result.getReportingPeriod()).isEqualTo("Monthly");

        verify(kpiRepo, times(1)).save(any(KPI.class));
    }

    @Test
    @DisplayName("save() - should return null when null DTO is passed")
    void save_withNullDTO_shouldReturnNull() {
        when(kpiRepo.save(null)).thenReturn(null);

        KPIDTO result = kpiService.save(null);

        assertThat(result).isNull();
    }

    // ==================== GET ALL ====================

    @Test
    @DisplayName("getAll() - should return list of KPI DTOs")
    void getAll_shouldReturnListOfDTOs() {
        KPI kpi2 = new KPI();
        kpi2.setKPIID(2L);
        kpi2.setName("On-Time Delivery");
        kpi2.setTarget(95.0);
        kpi2.setCurrentValue(90.0);

        when(kpiRepo.findAll()).thenReturn(List.of(kpiEntity, kpi2));

        List<KPIDTO> result = kpiService.getAll();

        assertThat(result).isNotNull().hasSize(2);
        assertThat(result.get(0).getName()).isEqualTo("Revenue Growth");
        assertThat(result.get(1).getName()).isEqualTo("On-Time Delivery");

        verify(kpiRepo, times(1)).findAll();
    }

    @Test
    @DisplayName("getAll() - should return empty list when no KPIs exist")
    void getAll_whenEmpty_shouldReturnEmptyList() {
        when(kpiRepo.findAll()).thenReturn(Collections.emptyList());

        List<KPIDTO> result = kpiService.getAll();

        assertThat(result).isNotNull().isEmpty();

        verify(kpiRepo, times(1)).findAll();
    }

    // ==================== GET BY ID ====================

    @Test
    @DisplayName("getById() - should return KPI DTO for valid ID")
    void getById_withValidId_shouldReturnDTO() {
        when(kpiRepo.findById(1L)).thenReturn(Optional.of(kpiEntity));

        KPIDTO result = kpiService.getById(1L);

        assertThat(result).isNotNull();
        assertThat(result.getKpiID()).isEqualTo(1L);
        assertThat(result.getName()).isEqualTo("Revenue Growth");
        assertThat(result.getDefinition()).isEqualTo("Measures monthly revenue growth");

        verify(kpiRepo, times(1)).findById(1L);
    }

    @Test
    @DisplayName("getById() - should throw KPINotFoundException for non-existent ID")
    void getById_withInvalidId_shouldThrowKPINotFoundException() {
        when(kpiRepo.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> kpiService.getById(99L))
                .isInstanceOf(KPINotFoundException.class)
                .hasMessage("KPI not found with id: 99");

        verify(kpiRepo, times(1)).findById(99L);
    }

    // ==================== DELETE ====================

    @Test
    @DisplayName("delete() - should delete KPI when ID exists")
    void delete_withValidId_shouldDeleteSuccessfully() {
        when(kpiRepo.existsById(1L)).thenReturn(true);
        doNothing().when(kpiRepo).deleteById(1L);

        assertThatCode(() -> kpiService.delete(1L)).doesNotThrowAnyException();

        verify(kpiRepo, times(1)).existsById(1L);
        verify(kpiRepo, times(1)).deleteById(1L);
    }

    @Test
    @DisplayName("delete() - should throw KPINotFoundException when ID does not exist")
    void delete_withInvalidId_shouldThrowKPINotFoundException() {
        when(kpiRepo.existsById(99L)).thenReturn(false);

        assertThatThrownBy(() -> kpiService.delete(99L))
                .isInstanceOf(KPINotFoundException.class)
                .hasMessage("KPI not found with id: 99");

        verify(kpiRepo, times(1)).existsById(99L);
        verify(kpiRepo, never()).deleteById(anyLong());
    }
}
