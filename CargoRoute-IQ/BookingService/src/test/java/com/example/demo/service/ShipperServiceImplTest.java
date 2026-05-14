package com.example.demo.service;

import com.example.demo.dto.ShipperDTO;
import com.example.demo.entity.Shipper;
import com.example.demo.entity.enums.ShipperStatus;
import com.example.demo.exception.BadRequestException;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.ShipperRepository;
import com.example.demo.serviceimpl.ShipperServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ShipperServiceImplTest {

    @Mock
    private ShipperRepository repo;

    @InjectMocks
    private ShipperServiceImpl shipperService;

    private Shipper shipper;
    private ShipperDTO shipperDTO;

    @BeforeEach
    void setUp() {
        shipper = new Shipper();
        shipper.setShipperID(1L);
        shipper.setName("Test Shipper");
        shipper.setContactInfo("test@email.com");
        shipper.setAccountTerms("Net 30");
        shipper.setStatus(ShipperStatus.ACTIVE);

        shipperDTO = new ShipperDTO();
        shipperDTO.setShipperID(1L);
        shipperDTO.setName("Test Shipper");
        shipperDTO.setContactInfo("test@email.com");
        shipperDTO.setAccountTerms("Net 30");
        shipperDTO.setStatus(ShipperStatus.ACTIVE);
    }

    // ── createShipper ────────────────────────────────────────────────────────

    @Test
    void createShipper_ShouldSaveAndReturnDTO() {
        when(repo.save(any(Shipper.class))).thenReturn(shipper);

        ShipperDTO result = shipperService.createShipper(shipperDTO);

        assertNotNull(result);
        assertEquals(1L, result.getShipperID());
        assertEquals("Test Shipper", result.getName());
        assertEquals(ShipperStatus.ACTIVE, result.getStatus());
        verify(repo, times(1)).save(any(Shipper.class));
    }

    @Test
    void createShipper_ShouldThrowBadRequest_WhenNameIsNull() {
        shipperDTO.setName(null);

        assertThrows(BadRequestException.class,
                () -> shipperService.createShipper(shipperDTO));
        verify(repo, never()).save(any());
    }

    @Test
    void createShipper_ShouldThrowBadRequest_WhenNameIsBlank() {
        shipperDTO.setName("   ");

        assertThrows(BadRequestException.class,
                () -> shipperService.createShipper(shipperDTO));
        verify(repo, never()).save(any());
    }

    // ── getAllShippers ───────────────────────────────────────────────────────

    @Test
    void getAllShippers_ShouldReturnAllShippers() {
        when(repo.findAll()).thenReturn(List.of(shipper));

        List<ShipperDTO> result = shipperService.getAllShippers();

        assertEquals(1, result.size());
        assertEquals("Test Shipper", result.get(0).getName());
        verify(repo, times(1)).findAll();
    }

    @Test
    void getAllShippers_ShouldReturnEmptyList_WhenNoShippers() {
        when(repo.findAll()).thenReturn(List.of());

        List<ShipperDTO> result = shipperService.getAllShippers();

        assertTrue(result.isEmpty());
    }

    // ── getShipperById ───────────────────────────────────────────────────────

    @Test
    void getShipperById_ShouldReturnShipper_WhenFound() {
        when(repo.findById(1L)).thenReturn(Optional.of(shipper));

        ShipperDTO result = shipperService.getShipperById(1L);

        assertNotNull(result);
        assertEquals(1L, result.getShipperID());
        assertEquals("Test Shipper", result.getName());
    }

    @Test
    void getShipperById_ShouldThrowException_WhenNotFound() {
        when(repo.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> shipperService.getShipperById(99L));
    }

    // ── getByShipperStatus ───────────────────────────────────────────────────

    @Test
    void getByShipperStatus_ShouldReturnMatchingShippers() {
        when(repo.findByStatus(ShipperStatus.ACTIVE)).thenReturn(List.of(shipper));

        List<ShipperDTO> result = shipperService.getByShipperStatus(ShipperStatus.ACTIVE);

        assertEquals(1, result.size());
        assertEquals(ShipperStatus.ACTIVE, result.get(0).getStatus());
    }

    @Test
    void getByShipperStatus_ShouldReturnEmpty_WhenNoMatch() {
        when(repo.findByStatus(ShipperStatus.SUSPENDED)).thenReturn(List.of());

        List<ShipperDTO> result = shipperService.getByShipperStatus(ShipperStatus.SUSPENDED);

        assertTrue(result.isEmpty());
    }
}
