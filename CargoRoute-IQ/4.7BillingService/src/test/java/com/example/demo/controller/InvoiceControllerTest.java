package com.example.demo.controller;

import com.example.demo.dto.InvoiceDTO;
import com.example.demo.dto.InvoiceRequiredResponseDTO;
import com.example.demo.service.InvoiceService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;

import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InvoiceControllerTest {

    @Mock
    private InvoiceService service;

    @InjectMocks
    private InvoiceController invoiceController;

    private InvoiceDTO invoiceDTO;
    private InvoiceRequiredResponseDTO responseDTO;

    @BeforeEach
    void setUp() {
        invoiceDTO = new InvoiceDTO();
        invoiceDTO.setInvoiceID(1L);
        invoiceDTO.setShipperID(100L);
        invoiceDTO.setPeriodStart(LocalDateTime.of(2026, 1, 1, 0, 0));
        invoiceDTO.setPeriodEnd(LocalDateTime.of(2026, 1, 31, 0, 0));
        invoiceDTO.setLinesJSON("[{\"item\":\"freight\"}]");
        invoiceDTO.setTotalAmount(500.0);
        invoiceDTO.setStatus("PENDING");

        responseDTO = new InvoiceRequiredResponseDTO();
        responseDTO.setInvoice(invoiceDTO);
        responseDTO.setShipper(null);
    }

    @Test
    @DisplayName("Should create invoice and return response")
    void testCreate() {
        when(service.save(any(InvoiceDTO.class))).thenReturn(invoiceDTO);
        ResponseEntity<InvoiceDTO> result = invoiceController.create(invoiceDTO);
        assertThat(result.getBody()).isNotNull();
        assertThat(result.getBody().getTotalAmount()).isEqualTo(500.0);
        verify(service, times(1)).save(any(InvoiceDTO.class));
    }

    @Test
    @DisplayName("Should return all invoices")
    void testGetAll() {
        when(service.getAll()).thenReturn(List.of(responseDTO, responseDTO));
        ResponseEntity<List<InvoiceRequiredResponseDTO>> result = invoiceController.getAll();
        assertThat(result.getBody()).hasSize(2);
        verify(service, times(1)).getAll();
    }

    @Test
    @DisplayName("Should return invoice by ID")
    void testGetById() {
        when(service.getById(1L)).thenReturn(responseDTO);
        ResponseEntity<InvoiceRequiredResponseDTO> result = invoiceController.getById(1L);
        assertThat(result.getBody()).isNotNull();
        assertThat(result.getBody().getInvoice().getInvoiceID()).isEqualTo(1L);
        verify(service, times(1)).getById(1L);
    }

    @Test
    @DisplayName("Should update invoice by ID")
    void testUpdate() {
        invoiceDTO.setTotalAmount(999.0);
        when(service.update(eq(1L), any(InvoiceDTO.class))).thenReturn(invoiceDTO);
        ResponseEntity<InvoiceDTO> result = invoiceController.update(1L, invoiceDTO);
        assertThat(result.getBody().getTotalAmount()).isEqualTo(999.0);
        verify(service, times(1)).update(eq(1L), any(InvoiceDTO.class));
    }

    @Test
    @DisplayName("Should delete invoice and return success message")
    void testDelete() {
        doNothing().when(service).delete(1L);
        ResponseEntity<String> result = invoiceController.delete(1L);
        assertThat(result.getBody()).isEqualTo("Invoice deleted successfully");
        verify(service, times(1)).delete(1L);
    }
}
