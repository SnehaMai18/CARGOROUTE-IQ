package com.example.demo.service;


import com.example.demo.dto.DispatchResponseDTO;
import com.example.demo.dto.DriverAckDTO;
import com.example.demo.dto.DriverAckResponseDTO;
import com.example.demo.dto.DriverDTO;
import com.example.demo.entities.Dispatch;
import com.example.demo.entities.Driver;
import com.example.demo.entities.DriverAck;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.DriverAckRepository;
import com.example.demo.serviceimpl.DriverAckServiceImpl;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DriverAckServiceImplTest {

    @Mock
    private DriverAckRepository driverAckRepository;

    @Mock
    private DispatchService dispatchService;

    @Mock
    private DriverService driverService;

    @InjectMocks
    private DriverAckServiceImpl driverAckService;

    private DriverAck driverAck;
    private DriverAckDTO driverAckDTO;

    @BeforeEach
    void setUp() {

        Dispatch dispatch = new Dispatch();
        dispatch.setDispatchID(10L);

        Driver driver = new Driver();
        driver.setDriverID(20L);

        driverAck = new DriverAck();
        driverAck.setAckID(1L);
        driverAck.setDispatch(dispatch);
        driverAck.setDriver(driver);
        driverAck.setAckAt(LocalDateTime.now());
        driverAck.setNotes("Acknowledged");

        driverAckDTO = new DriverAckDTO();
        driverAckDTO.setDispatchID(10L);
        driverAckDTO.setDriverID(20L);
        driverAckDTO.setAckAt(LocalDateTime.now());
        driverAckDTO.setNotes("Acknowledged");
    }

    // ── INSERT ─────────────────────────────────────────────

    @Test
    void insert_ShouldSaveAndReturnDTO() {

        when(driverAckRepository.save(any(DriverAck.class)))
                .thenReturn(driverAck);

        DriverAckDTO result = driverAckService.insert(driverAckDTO);

        assertNotNull(result);
        assertEquals(10L, result.getDispatchID());
        assertEquals(20L, result.getDriverID());
        assertEquals("Acknowledged", result.getNotes());
    }

    @Test
    void insert_ShouldThrowException_WhenMandatoryFieldsMissing() {

        DriverAckDTO invalid = new DriverAckDTO();

        assertThrows(IllegalArgumentException.class,
                () -> driverAckService.insert(invalid));
    }

    // ── FETCH BY ID ─────────────────────────────────────────

    @Test
    void fetchByID_ShouldReturnResponseDTO() {

        when(driverAckRepository.findById(1L))
                .thenReturn(Optional.of(driverAck));
        when(dispatchService.fetchByID(10L))
                .thenReturn(new DispatchResponseDTO());
        when(driverService.fetchByID(20L))
                .thenReturn(new DriverDTO());

        DriverAckResponseDTO result =
                driverAckService.fetchByID(1L);

        assertNotNull(result);
        assertEquals(1L, result.getAckID());
        assertEquals("Acknowledged", result.getNotes());
    }

    @Test
    void fetchByID_ShouldThrowException_WhenNotFound() {

        when(driverAckRepository.findById(99L))
                .thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> driverAckService.fetchByID(99L));
    }

    // ── FETCH BY DISPATCH ID ────────────────────────────────

    @Test
    void fetchByDispatchID_ShouldReturnResponseList() {

        when(driverAckRepository.findByDispatch_DispatchID(10L))
                .thenReturn(List.of(driverAck));
        when(dispatchService.fetchByID(10L))
                .thenReturn(new DispatchResponseDTO());
        when(driverService.fetchByID(20L))
                .thenReturn(new DriverDTO());

        List<DriverAckResponseDTO> result =
                driverAckService.fetchByDispatchID(10L);

        assertEquals(1, result.size());
        assertEquals(1L, result.get(0).getAckID());
    }

    @Test
    void fetchByDispatchID_ShouldThrowException_WhenNotFound() {

        when(driverAckRepository.findByDispatch_DispatchID(10L))
                .thenReturn(List.of());   // ✅ EMPTY LIST

        assertThrows(ResourceNotFoundException.class,
                () -> driverAckService.fetchByDispatchID(10L));
    }

    // ── FETCH BY DRIVER ID ──────────────────────────────────

    @Test
    void fetchByDriverID_ShouldReturnResponseList() {

        when(driverAckRepository.findByDriver_DriverID(20L))
                .thenReturn(List.of(driverAck));
        when(dispatchService.fetchByID(10L))
                .thenReturn(new DispatchResponseDTO());
        when(driverService.fetchByID(20L))
                .thenReturn(new DriverDTO());

        List<DriverAckResponseDTO> result =
                driverAckService.fetchByDriverID(20L);

        assertEquals(1, result.size());
        assertEquals(1L, result.get(0).getAckID());
    }

    @Test
    void fetchByDriverID_ShouldThrowException_WhenNotFound() {

        when(driverAckRepository.findByDriver_DriverID(20L))
                .thenReturn(List.of());   // ✅ EMPTY LIST

        assertThrows(ResourceNotFoundException.class,
                () -> driverAckService.fetchByDriverID(20L));
    }

    // ── FETCH ALL ───────────────────────────────────────────

    @Test
    void fetchAll_ShouldReturnList() {

        when(driverAckRepository.findAll())
                .thenReturn(List.of(driverAck));
        when(dispatchService.fetchByID(10L))
                .thenReturn(new DispatchResponseDTO());
        when(driverService.fetchByID(20L))
                .thenReturn(new DriverDTO());

        List<DriverAckResponseDTO> list =
                driverAckService.fetchAll();

        assertEquals(1, list.size());
    }
}