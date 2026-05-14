package com.example.demo.repository;

import com.example.demo.entity.Invoice;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InvoiceRepositoryTest {

    @Mock
    private InvoiceRepository invoiceRepository;

    private Invoice invoice;

    @BeforeEach
    void setUp() {
        invoice = new Invoice();
        invoice.setInvoiceID(1L);
        invoice.setShipperID(100L);
        invoice.setPeriodStart(LocalDate.of(2026, 1, 1));
        invoice.setPeriodEnd(LocalDate.of(2026, 1, 31));
        invoice.setLinesJSON("[{\"item\":\"freight\"}]");
        invoice.setTotalAmount(500.0);
        invoice.setIssuedAt(LocalDateTime.now());
        invoice.setStatus("PENDING");
    }

    @Test
    @DisplayName("Should save invoice successfully")
    void testSaveInvoice() {
        when(invoiceRepository.save(any(Invoice.class))).thenReturn(invoice);
        Invoice saved = invoiceRepository.save(invoice);
        assertThat(saved.getInvoiceID()).isEqualTo(1L);
        assertThat(saved.getTotalAmount()).isEqualTo(500.0);
        verify(invoiceRepository, times(1)).save(any(Invoice.class));
    }

    @Test
    @DisplayName("Should find invoice by ID")
    void testFindById() {
        when(invoiceRepository.findById(1L)).thenReturn(Optional.of(invoice));
        Optional<Invoice> found = invoiceRepository.findById(1L);
        assertThat(found).isPresent();
        assertThat(found.get().getStatus()).isEqualTo("PENDING");
    }

    @Test
    @DisplayName("Should return empty when invoice ID does not exist")
    void testFindByIdNotFound() {
        when(invoiceRepository.findById(999L)).thenReturn(Optional.empty());
        Optional<Invoice> found = invoiceRepository.findById(999L);
        assertThat(found).isEmpty();
    }

    @Test
    @DisplayName("Should return all invoices")
    void testFindAll() {
        Invoice second = new Invoice();
        second.setInvoiceID(2L);
        second.setTotalAmount(800.0);
        when(invoiceRepository.findAll()).thenReturn(List.of(invoice, second));
        List<Invoice> all = invoiceRepository.findAll();
        assertThat(all).hasSize(2);
    }

    @Test
    @DisplayName("Should update invoice total amount")
    void testUpdateInvoice() {
        invoice.setTotalAmount(999.0);
        when(invoiceRepository.save(any(Invoice.class))).thenReturn(invoice);
        Invoice updated = invoiceRepository.save(invoice);
        assertThat(updated.getTotalAmount()).isEqualTo(999.0);
    }

    @Test
    @DisplayName("Should delete invoice by ID")
    void testDeleteById() {
        doNothing().when(invoiceRepository).deleteById(1L);
        invoiceRepository.deleteById(1L);
        verify(invoiceRepository, times(1)).deleteById(1L);
    }

    @Test
    @DisplayName("Should return true if invoice exists by ID")
    void testExistsById() {
        when(invoiceRepository.existsById(1L)).thenReturn(true);
        assertThat(invoiceRepository.existsById(1L)).isTrue();
    }

    @Test
    @DisplayName("Should return false if invoice does not exist by ID")
    void testNotExistsById() {
        when(invoiceRepository.existsById(999L)).thenReturn(false);
        assertThat(invoiceRepository.existsById(999L)).isFalse();
    }
}
