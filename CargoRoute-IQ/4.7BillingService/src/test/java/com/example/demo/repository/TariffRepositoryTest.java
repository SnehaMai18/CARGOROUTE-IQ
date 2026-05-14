package com.example.demo.repository;

import com.example.demo.entity.Tariff;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TariffRepositoryTest {

    @Mock
    private TariffRepository tariffRepository;

    private Tariff tariff;

    @BeforeEach
    void setUp() {
        tariff = new Tariff();
        tariff.setTariffID(1L);
        tariff.setServiceType("STANDARD");
        tariff.setRatePerKg(2.5);
        tariff.setRatePerM3(10.0);
        tariff.setMinCharge(50.0);
        tariff.setEffectiveFrom(LocalDate.of(2026, 1, 1));
        tariff.setEffectiveTo(LocalDate.of(2026, 12, 31));
        tariff.setStatus("ACTIVE");
    }

    @Test
    @DisplayName("Should save tariff successfully")
    void testSaveTariff() {
        when(tariffRepository.save(any(Tariff.class))).thenReturn(tariff);
        Tariff saved = tariffRepository.save(tariff);
        assertThat(saved.getTariffID()).isEqualTo(1L);
        assertThat(saved.getServiceType()).isEqualTo("STANDARD");
        verify(tariffRepository, times(1)).save(any(Tariff.class));
    }

    @Test
    @DisplayName("Should find tariff by ID")
    void testFindById() {
        when(tariffRepository.findById(1L)).thenReturn(Optional.of(tariff));
        Optional<Tariff> found = tariffRepository.findById(1L);
        assertThat(found).isPresent();
        assertThat(found.get().getStatus()).isEqualTo("ACTIVE");
    }

    @Test
    @DisplayName("Should return empty when tariff ID does not exist")
    void testFindByIdNotFound() {
        when(tariffRepository.findById(999L)).thenReturn(Optional.empty());
        Optional<Tariff> found = tariffRepository.findById(999L);
        assertThat(found).isEmpty();
    }

    @Test
    @DisplayName("Should return all tariffs")
    void testFindAll() {
        Tariff second = new Tariff();
        second.setTariffID(2L);
        second.setServiceType("EXPRESS");
        when(tariffRepository.findAll()).thenReturn(List.of(tariff, second));
        List<Tariff> all = tariffRepository.findAll();
        assertThat(all).hasSize(2);
    }

    @Test
    @DisplayName("Should update tariff rate per kg")
    void testUpdateTariff() {
        tariff.setRatePerKg(9.9);
        when(tariffRepository.save(any(Tariff.class))).thenReturn(tariff);
        Tariff updated = tariffRepository.save(tariff);
        assertThat(updated.getRatePerKg()).isEqualTo(9.9);
    }

    @Test
    @DisplayName("Should delete tariff by ID")
    void testDeleteById() {
        doNothing().when(tariffRepository).deleteById(1L);
        tariffRepository.deleteById(1L);
        verify(tariffRepository, times(1)).deleteById(1L);
    }

    @Test
    @DisplayName("Should return true if tariff exists by ID")
    void testExistsById() {
        when(tariffRepository.existsById(1L)).thenReturn(true);
        assertThat(tariffRepository.existsById(1L)).isTrue();
    }

    @Test
    @DisplayName("Should return false if tariff does not exist by ID")
    void testNotExistsById() {
        when(tariffRepository.existsById(999L)).thenReturn(false);
        assertThat(tariffRepository.existsById(999L)).isFalse();
    }
}
