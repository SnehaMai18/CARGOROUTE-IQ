package com.example.demo.ServiceImpl;

import com.example.demo.dto.BillingLineDTO;
import com.example.demo.dto.BillingLineResponseDTO;
import com.example.demo.entity.BillingLine;
import com.example.demo.exception.BillingLineNotFoundException;
import com.example.demo.repository.BillingLineRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BillingLineServiceImplTest {

    @Mock
    private BillingLineRepository repository;

    @Mock
    private RestTemplate restTemplate;

    @InjectMocks
    private BillingLineServiceImpl billingLineServiceImpl;

    private BillingLine billingLine;
    private BillingLineDTO dto;

    @BeforeEach
    void setUp() {
        billingLine = new BillingLine();
        billingLine.setBillingLineID(1L);
        billingLine.setBookingID(1L);
        billingLine.setLoadID(10L);
        billingLine.setAmount(500.0);
        billingLine.setTariffApplied("STANDARD");
        billingLine.setNotes("Test notes");

        dto = new BillingLineDTO();
        dto.setBookingID(1L);
        dto.setLoadID(10L);
        dto.setAmount(500.0);
        dto.setTariffApplied("STANDARD");
        dto.setNotes("Test notes");
    }

    // ================= CREATE TESTS =================

    @Test
    @DisplayName("Should create billing line successfully")
    void testCreate_Success() {
        when(repository.save(any(BillingLine.class))).thenReturn(billingLine);
        BillingLineResponseDTO result = billingLineServiceImpl.create(dto);
        assertThat(result).isNotNull();
        assertThat(result.getBilling().getAmount()).isEqualTo(500.0);
        verify(repository, times(1)).save(any(BillingLine.class));
    }

    @Test
    @DisplayName("Should throw IllegalArgumentException when bookingID is null")
    void testCreate_NullBookingID() {
        dto.setBookingID(null);
        assertThatThrownBy(() -> billingLineServiceImpl.create(dto))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Booking ID is required");
        verify(repository, never()).save(any());
    }

    @Test
    @DisplayName("Should throw IllegalArgumentException when loadID is null")
    void testCreate_NullLoadID() {
        dto.setLoadID(null);
        assertThatThrownBy(() -> billingLineServiceImpl.create(dto))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Load ID is required");
        verify(repository, never()).save(any());
    }

    @Test
    @DisplayName("Should throw IllegalArgumentException when amount is zero or negative")
    void testCreate_InvalidAmount() {
        dto.setAmount(-10.0);
        assertThatThrownBy(() -> billingLineServiceImpl.create(dto))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Amount must be greater than zero");
        verify(repository, never()).save(any());
    }

    @Test
    @DisplayName("Should throw IllegalArgumentException when tariff is blank")
    void testCreate_BlankTariff() {
        dto.setTariffApplied("");
        assertThatThrownBy(() -> billingLineServiceImpl.create(dto))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Tariff must be specified");
        verify(repository, never()).save(any());
    }

    // ================= GET BY ID TESTS =================

    @Test
    @DisplayName("Should return billing line by ID")
    void testGetById_Success() {
        when(repository.findById(1L)).thenReturn(Optional.of(billingLine));
        BillingLineResponseDTO result = billingLineServiceImpl.getById(1L);
        assertThat(result).isNotNull();
        assertThat(result.getBilling().getBillingLineID()).isEqualTo(1L);
        verify(repository, times(1)).findById(1L);
    }

    @Test
    @DisplayName("Should throw BillingLineNotFoundException when ID not found")
    void testGetById_NotFound() {
        when(repository.findById(99L)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> billingLineServiceImpl.getById(99L))
                .isInstanceOf(BillingLineNotFoundException.class)
                .hasMessage("BillingLine with given ID not found");
    }

    // ================= GET ALL TESTS =================

    @Test
    @DisplayName("Should return all billing lines")
    void testGetAll() {
        when(repository.findAll()).thenReturn(List.of(billingLine, billingLine));
        List<BillingLineResponseDTO> result = billingLineServiceImpl.getAll();
        assertThat(result).hasSize(2);
        verify(repository, times(1)).findAll();
    }

    @Test
    @DisplayName("Should return empty list when no billing lines exist")
    void testGetAll_Empty() {
        when(repository.findAll()).thenReturn(List.of());
        List<BillingLineResponseDTO> result = billingLineServiceImpl.getAll();
        assertThat(result).isEmpty();
    }

    // ================= UPDATE TESTS =================

    @Test
    @DisplayName("Should update billing line successfully")
    void testUpdate_Success() {
        dto.setAmount(750.0);
        billingLine.setAmount(750.0);
        when(repository.findById(1L)).thenReturn(Optional.of(billingLine));
        when(repository.save(any(BillingLine.class))).thenReturn(billingLine);
        BillingLineResponseDTO result = billingLineServiceImpl.update(1L, dto);
        assertThat(result.getBilling().getAmount()).isEqualTo(750.0);
        verify(repository, times(1)).save(any(BillingLine.class));
    }

    @Test
    @DisplayName("Should throw BillingLineNotFoundException when updating non-existing ID")
    void testUpdate_NotFound() {
        when(repository.findById(99L)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> billingLineServiceImpl.update(99L, dto))
                .isInstanceOf(BillingLineNotFoundException.class)
                .hasMessage("BillingLine with given ID not found");
    }

    @Test
    @DisplayName("Should throw IllegalArgumentException when updating with invalid amount")
    void testUpdate_InvalidAmount() {
        dto.setAmount(0.0);
        assertThatThrownBy(() -> billingLineServiceImpl.update(1L, dto))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Amount must be greater than zero");
        verify(repository, never()).findById(any());
    }

    // ================= DELETE TESTS =================

    @Test
    @DisplayName("Should delete billing line successfully")
    void testDelete_Success() {
        when(repository.existsById(1L)).thenReturn(true);
        doNothing().when(repository).deleteById(1L);
        billingLineServiceImpl.delete(1L);
        verify(repository, times(1)).deleteById(1L);
    }

    @Test
    @DisplayName("Should throw BillingLineNotFoundException when deleting non-existing ID")
    void testDelete_NotFound() {
        when(repository.existsById(99L)).thenReturn(false);
        assertThatThrownBy(() -> billingLineServiceImpl.delete(99L))
                .isInstanceOf(BillingLineNotFoundException.class)
                .hasMessage("BillingLine with given ID not found");
        verify(repository, never()).deleteById(any());
    }
}
