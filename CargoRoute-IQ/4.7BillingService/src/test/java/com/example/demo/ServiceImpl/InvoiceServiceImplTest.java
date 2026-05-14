package com.example.demo.ServiceImpl;

import com.example.demo.dto.InvoiceDTO;
import com.example.demo.dto.InvoiceRequiredResponseDTO;
import com.example.demo.entity.Invoice;
import com.example.demo.exception.InvoiceNotFoundException;
import com.example.demo.repository.InvoiceRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InvoiceServiceImplTest {

    @Mock
    private InvoiceRepository repo;

    @Mock
    private RestTemplate restTemplate;

    @InjectMocks
    private InvoiceServiceimpl invoiceServiceimpl;

    private Invoice invoice;
    private InvoiceDTO invoiceDTO;

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

        invoiceDTO = new InvoiceDTO();
        invoiceDTO.setShipperID(100L);
        invoiceDTO.setPeriodStart(LocalDateTime.of(2026, 1, 1, 0, 0));
        invoiceDTO.setPeriodEnd(LocalDateTime.of(2026, 1, 31, 0, 0));
        invoiceDTO.setLinesJSON("[{\"item\":\"freight\"}]");
        invoiceDTO.setTotalAmount(500.0);
        invoiceDTO.setStatus("PENDING");
    }

    // ================= SAVE TESTS =================

    @Test
    @DisplayName("Should save invoice successfully")
    void testSave_Success() {
        when(repo.save(any(Invoice.class))).thenReturn(invoice);
        InvoiceDTO result = invoiceServiceimpl.save(invoiceDTO);
        assertThat(result).isNotNull();
        assertThat(result.getTotalAmount()).isEqualTo(500.0);
        verify(repo, times(1)).save(any(Invoice.class));
    }

    // ================= GET ALL TESTS =================

    @Test
    @DisplayName("Should return all invoices with shipper data")
    void testGetAll_Success() {
        when(repo.findAll()).thenReturn(List.of(invoice));
        when(restTemplate.getForObject(anyString(), eq(com.example.demo.dto.ShipperDTO.class))).thenReturn(null);
        List<InvoiceRequiredResponseDTO> result = invoiceServiceimpl.getAll();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getInvoice().getTotalAmount()).isEqualTo(500.0);
    }

    @Test
    @DisplayName("Should throw InvoiceNotFoundException when no invoices exist")
    void testGetAll_Empty() {
        when(repo.findAll()).thenReturn(List.of());
        assertThatThrownBy(() -> invoiceServiceimpl.getAll())
                .isInstanceOf(InvoiceNotFoundException.class)
                .hasMessage("No invoices found");
    }

    // ================= GET BY ID TESTS =================

    @Test
    @DisplayName("Should return invoice by ID")
    void testGetById_Success() {
        when(repo.findById(1L)).thenReturn(Optional.of(invoice));
        when(restTemplate.getForObject(anyString(), eq(com.example.demo.dto.ShipperDTO.class))).thenReturn(null);
        InvoiceRequiredResponseDTO result = invoiceServiceimpl.getById(1L);
        assertThat(result).isNotNull();
        assertThat(result.getInvoice().getInvoiceID()).isEqualTo(1L);
    }

    @Test
    @DisplayName("Should throw InvoiceNotFoundException when ID not found")
    void testGetById_NotFound() {
        when(repo.findById(99L)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> invoiceServiceimpl.getById(99L))
                .isInstanceOf(InvoiceNotFoundException.class)
                .hasMessage("Invoice not found with id: 99");
    }

    // ================= UPDATE TESTS =================

    @Test
    @DisplayName("Should update invoice successfully")
    void testUpdate_Success() {
        invoiceDTO.setTotalAmount(999.0);
        invoice.setTotalAmount(999.0);
        when(repo.findById(1L)).thenReturn(Optional.of(invoice));
        when(repo.save(any(Invoice.class))).thenReturn(invoice);
        InvoiceDTO result = invoiceServiceimpl.update(1L, invoiceDTO);
        assertThat(result.getTotalAmount()).isEqualTo(999.0);
        verify(repo, times(1)).save(any(Invoice.class));
    }

    @Test
    @DisplayName("Should throw InvoiceNotFoundException when updating non-existing ID")
    void testUpdate_NotFound() {
        when(repo.findById(99L)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> invoiceServiceimpl.update(99L, invoiceDTO))
                .isInstanceOf(InvoiceNotFoundException.class)
                .hasMessage("Invoice not found with id: 99");
    }

    // ================= DELETE TESTS =================

    @Test
    @DisplayName("Should delete invoice successfully")
    void testDelete_Success() {
        when(repo.existsById(1L)).thenReturn(true);
        doNothing().when(repo).deleteById(1L);
        invoiceServiceimpl.delete(1L);
        verify(repo, times(1)).deleteById(1L);
    }

    @Test
    @DisplayName("Should throw InvoiceNotFoundException when deleting non-existing ID")
    void testDelete_NotFound() {
        when(repo.existsById(99L)).thenReturn(false);
        assertThatThrownBy(() -> invoiceServiceimpl.delete(99L))
                .isInstanceOf(InvoiceNotFoundException.class)
                .hasMessage("Invoice not found with id: 99");
        verify(repo, never()).deleteById(any());
    }
}
