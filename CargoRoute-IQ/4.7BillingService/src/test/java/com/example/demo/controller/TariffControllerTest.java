package com.example.demo.controller;

import com.example.demo.dto.TariffDTO;
import com.example.demo.service.TariffService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TariffControllerTest {

    @Mock
    private TariffService service;

    @InjectMocks
    private TariffController tariffController;

    private TariffDTO tariffDTO;

    @BeforeEach
    void setUp() {
        tariffDTO = new TariffDTO();
        tariffDTO.setTariffID(1L);
        tariffDTO.setServiceType("STANDARD");
        tariffDTO.setRatePerKg(2.5);
        tariffDTO.setRatePerM3(10.0);
        tariffDTO.setMinCharge(50.0);
        tariffDTO.setEffectiveFrom(LocalDate.of(2026, 1, 1));
        tariffDTO.setEffectiveTo(LocalDate.of(2026, 12, 31));
        tariffDTO.setStatus("ACTIVE");
    }

    @Test
    @DisplayName("Should create tariff and return response")
    void testCreate() {
        when(service.save(any(TariffDTO.class))).thenReturn(tariffDTO);
        ResponseEntity<TariffDTO> result = tariffController.createTariff(tariffDTO);
        assertThat(result.getBody()).isNotNull();
        assertThat(result.getBody().getServiceType()).isEqualTo("STANDARD");
        verify(service, times(1)).save(any(TariffDTO.class));
    }

    @Test
    @DisplayName("Should return all tariffs")
    void testGetAll() {
        when(service.getAll()).thenReturn(List.of(tariffDTO, tariffDTO));
        ResponseEntity<List<TariffDTO>> result = tariffController.getAllTariffs();
        assertThat(result.getBody()).hasSize(2);
        verify(service, times(1)).getAll();
    }

    @Test
    @DisplayName("Should return tariff by ID")
    void testGetById() {
        when(service.getById(1L)).thenReturn(tariffDTO);
        ResponseEntity<TariffDTO> result = tariffController.getTariffById(1L);
        assertThat(result.getBody()).isNotNull();
        assertThat(result.getBody().getTariffID()).isEqualTo(1L);
        verify(service, times(1)).getById(1L);
    }

    @Test
    @DisplayName("Should update tariff by ID")
    void testUpdate() {
        tariffDTO.setRatePerKg(9.9);
        when(service.update(eq(1L), any(TariffDTO.class))).thenReturn(tariffDTO);
        ResponseEntity<TariffDTO> result = tariffController.updateTariff(1L, tariffDTO);
        assertThat(result.getBody().getRatePerKg()).isEqualTo(9.9);
        verify(service, times(1)).update(eq(1L), any(TariffDTO.class));
    }

    @Test
    @DisplayName("Should delete tariff and return success message")
    void testDelete() {
        doNothing().when(service).delete(1L);
        ResponseEntity<String> result = tariffController.deleteTariff(1L);
        assertThat(result.getBody()).isEqualTo("Tariff deleted successfully");
        verify(service, times(1)).delete(1L);
    }
}
