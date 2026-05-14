package com.example.demo.ServiceImpl;

import com.example.demo.dto.TariffDTO;
import com.example.demo.entity.Tariff;
import com.example.demo.exception.TariffNotFoundException;
import com.example.demo.repository.TariffRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TariffServiceImplTest {

    @Mock
    private TariffRepository repo;

    @InjectMocks
    private TariffSerivceimpl tariffSerivceimpl;

    private Tariff tariff;
    private TariffDTO tariffDTO;

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

        tariffDTO = new TariffDTO();
        tariffDTO.setServiceType("STANDARD");
        tariffDTO.setRatePerKg(2.5);
        tariffDTO.setRatePerM3(10.0);
        tariffDTO.setMinCharge(50.0);
        tariffDTO.setEffectiveFrom(LocalDate.of(2026, 1, 1));
        tariffDTO.setEffectiveTo(LocalDate.of(2026, 12, 31));
        tariffDTO.setStatus("ACTIVE");
    }

    // ================= SAVE TESTS =================

    @Test
    @DisplayName("Should save tariff successfully")
    void testSave_Success() {
        when(repo.save(any(Tariff.class))).thenReturn(tariff);
        TariffDTO result = tariffSerivceimpl.save(tariffDTO);
        assertThat(result).isNotNull();
        assertThat(result.getServiceType()).isEqualTo("STANDARD");
        assertThat(result.getRatePerKg()).isEqualTo(2.5);
        verify(repo, times(1)).save(any(Tariff.class));
    }

    // ================= GET ALL TESTS =================

    @Test
    @DisplayName("Should return all tariffs")
    void testGetAll_Success() {
        when(repo.findAll()).thenReturn(List.of(tariff, tariff));
        List<TariffDTO> result = tariffSerivceimpl.getAll();
        assertThat(result).hasSize(2);
        verify(repo, times(1)).findAll();
    }

    @Test
    @DisplayName("Should throw TariffNotFoundException when no tariffs exist")
    void testGetAll_Empty() {
        when(repo.findAll()).thenReturn(List.of());
        assertThatThrownBy(() -> tariffSerivceimpl.getAll())
                .isInstanceOf(TariffNotFoundException.class)
                .hasMessage("No tariffs found");
    }

    // ================= GET BY ID TESTS =================

    @Test
    @DisplayName("Should return tariff by ID")
    void testGetById_Success() {
        when(repo.findById(1L)).thenReturn(Optional.of(tariff));
        TariffDTO result = tariffSerivceimpl.getById(1L);
        assertThat(result).isNotNull();
        assertThat(result.getTariffID()).isEqualTo(1L);
        verify(repo, times(1)).findById(1L);
    }

    @Test
    @DisplayName("Should throw TariffNotFoundException when ID not found")
    void testGetById_NotFound() {
        when(repo.findById(99L)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> tariffSerivceimpl.getById(99L))
                .isInstanceOf(TariffNotFoundException.class)
                .hasMessage("Tariff not found with id: 99");
    }

    // ================= UPDATE TESTS =================

    @Test
    @DisplayName("Should update tariff successfully")
    void testUpdate_Success() {
        tariffDTO.setRatePerKg(9.9);
        tariff.setRatePerKg(9.9);
        when(repo.findById(1L)).thenReturn(Optional.of(tariff));
        when(repo.save(any(Tariff.class))).thenReturn(tariff);
        TariffDTO result = tariffSerivceimpl.update(1L, tariffDTO);
        assertThat(result.getRatePerKg()).isEqualTo(9.9);
        verify(repo, times(1)).save(any(Tariff.class));
    }

    @Test
    @DisplayName("Should throw TariffNotFoundException when updating non-existing ID")
    void testUpdate_NotFound() {
        when(repo.findById(99L)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> tariffSerivceimpl.update(99L, tariffDTO))
                .isInstanceOf(TariffNotFoundException.class)
                .hasMessage("Tariff not found with id: 99");
    }

    // ================= DELETE TESTS =================

    @Test
    @DisplayName("Should delete tariff successfully")
    void testDelete_Success() {
        when(repo.existsById(1L)).thenReturn(true);
        doNothing().when(repo).deleteById(1L);
        tariffSerivceimpl.delete(1L);
        verify(repo, times(1)).deleteById(1L);
    }

    @Test
    @DisplayName("Should throw TariffNotFoundException when deleting non-existing ID")
    void testDelete_NotFound() {
        when(repo.existsById(99L)).thenReturn(false);
        assertThatThrownBy(() -> tariffSerivceimpl.delete(99L))
                .isInstanceOf(TariffNotFoundException.class)
                .hasMessage("Tariff not found with id: 99");
        verify(repo, never()).deleteById(any());
    }
}
