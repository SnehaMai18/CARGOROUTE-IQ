package com.example.demo.controller;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import com.example.demo.dto.BillingLineDTO;
import com.example.demo.dto.BillingLineResponseDTO;
import com.example.demo.service.BillingLineService;

@ExtendWith(MockitoExtension.class)
class BillingLineControllerTest {

    @Mock
    private BillingLineService service;

    @InjectMocks
    private BillingLineController billingLineController;

    private BillingLineDTO dto;
    private BillingLineResponseDTO responseDTO;

    @BeforeEach
    void setUp() {
        dto = new BillingLineDTO();
        dto.setBookingID(1L);
        dto.setLoadID(10L);
        dto.setAmount(500.0);
        dto.setTariffApplied("STANDARD");
        dto.setNotes("Test notes");

        responseDTO = new BillingLineResponseDTO();
        BillingLineDTO billing = new BillingLineDTO();
        billing.setBillingLineID(1L);
        billing.setBookingID(1L);
        billing.setLoadID(10L);
        billing.setAmount(500.0);
        billing.setTariffApplied("STANDARD");
        responseDTO.setBilling(billing);
    }

    @Test
    @DisplayName("Should create billing line and return response")
    void testCreate() {
        when(service.create(any(BillingLineDTO.class))).thenReturn(responseDTO);
        BillingLineResponseDTO result = billingLineController.create(dto);
        assertThat(result).isNotNull();
        assertThat(result.getBilling().getAmount()).isEqualTo(500.0);
        verify(service, times(1)).create(any(BillingLineDTO.class));
    }

    @Test
    @DisplayName("Should get billing line by ID")
    void testGetById() {
        when(service.getById(1L)).thenReturn(responseDTO);
        BillingLineResponseDTO result = billingLineController.get(1L);
        assertThat(result).isNotNull();
        assertThat(result.getBilling().getBillingLineID()).isEqualTo(1L);
        verify(service, times(1)).getById(1L);
    }

    @Test
    @DisplayName("Should return all billing lines")
    void testGetAll() {
        when(service.getAll()).thenReturn(List.of(responseDTO, responseDTO));
        List<BillingLineResponseDTO> result = billingLineController.getAll();
        assertThat(result).hasSize(2);
        verify(service, times(1)).getAll();
    }

    @Test
    @DisplayName("Should update billing line by ID")
    void testUpdate() {
        dto.setAmount(750.0);
        responseDTO.getBilling().setAmount(750.0);
        when(service.update(eq(1L), any(BillingLineDTO.class))).thenReturn(responseDTO);
        BillingLineResponseDTO result = billingLineController.update(1L, dto);
        assertThat(result.getBilling().getAmount()).isEqualTo(750.0);
        verify(service, times(1)).update(eq(1L), any(BillingLineDTO.class));
    }

    @Test
    @DisplayName("Should delete billing line by ID")
    void testDelete() {
        doNothing().when(service).delete(1L);
        billingLineController.delete(1L);
        verify(service, times(1)).delete(1L);
    }
}
