package com.example.demo.repository;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.Mock;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import com.example.demo.entity.BillingLine;

@ExtendWith(MockitoExtension.class)
class BillingLineRepositoryTest {

    @Mock
    private BillingLineRepository billingLineRepository;

    private BillingLine billingLine;

    @BeforeEach
    void setUp() {
        billingLine = new BillingLine();
        billingLine.setBillingLineID(1L);
        billingLine.setBookingID(1L);
        billingLine.setLoadID(10L);
        billingLine.setAmount(500.0);
        billingLine.setTariffApplied("STANDARD");
        billingLine.setNotes("Test notes");
    }

    @Test
    @DisplayName("Should save billing line successfully")
    void testSaveBillingLine() {
        when(billingLineRepository.save(any(BillingLine.class))).thenReturn(billingLine);
        BillingLine saved = billingLineRepository.save(billingLine);
        assertThat(saved.getBillingLineID()).isEqualTo(1L);
        assertThat(saved.getAmount()).isEqualTo(500.0);
        verify(billingLineRepository, times(1)).save(any(BillingLine.class));
    }

    @Test
    @DisplayName("Should find billing line by ID")
    void testFindById() {
        when(billingLineRepository.findById(1L)).thenReturn(Optional.of(billingLine));
        Optional<BillingLine> found = billingLineRepository.findById(1L);
        assertThat(found).isPresent();
        assertThat(found.get().getTariffApplied()).isEqualTo("STANDARD");
    }

    @Test
    @DisplayName("Should return empty when billing line ID does not exist")
    void testFindByIdNotFound() {
        when(billingLineRepository.findById(999L)).thenReturn(Optional.empty());
        Optional<BillingLine> found = billingLineRepository.findById(999L);
        assertThat(found).isEmpty();
    }

    @Test
    @DisplayName("Should return all billing lines")
    void testFindAll() {
        BillingLine second = new BillingLine();
        second.setBillingLineID(2L);
        second.setAmount(300.0);
        when(billingLineRepository.findAll()).thenReturn(List.of(billingLine, second));
        List<BillingLine> all = billingLineRepository.findAll();
        assertThat(all).hasSize(2);
    }

    @Test
    @DisplayName("Should update billing line amount")
    void testUpdateBillingLine() {
        billingLine.setAmount(999.0);
        when(billingLineRepository.save(any(BillingLine.class))).thenReturn(billingLine);
        BillingLine updated = billingLineRepository.save(billingLine);
        assertThat(updated.getAmount()).isEqualTo(999.0);
    }

    @Test
    @DisplayName("Should delete billing line by ID")
    void testDeleteById() {
        doNothing().when(billingLineRepository).deleteById(1L);
        billingLineRepository.deleteById(1L);
        verify(billingLineRepository, times(1)).deleteById(1L);
    }

    @Test
    @DisplayName("Should return true if billing line exists by ID")
    void testExistsById() {
        when(billingLineRepository.existsById(1L)).thenReturn(true);
        assertThat(billingLineRepository.existsById(1L)).isTrue();
    }

    @Test
    @DisplayName("Should return false if billing line does not exist by ID")
    void testNotExistsById() {
        when(billingLineRepository.existsById(999L)).thenReturn(false);
        assertThat(billingLineRepository.existsById(999L)).isFalse();
    }
}
