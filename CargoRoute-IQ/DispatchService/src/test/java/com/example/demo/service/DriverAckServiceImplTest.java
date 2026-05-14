package com.example.demo.service;


import com.example.demo.clients.NotificationClient;
import com.example.demo.clients.RoleResolverClient;
import com.example.demo.dto.DispatchDTO;
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
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DriverAckServiceImplTest {

    @Mock
    private DriverAckRepository driverAckRepository;

    @Mock
    private DispatchService dispatchService;

    @Mock
    private DriverService driverService;

    @Mock
    private NotificationClient notificationClient;

    @Mock
    private RoleResolverClient roleResolverClient;

    @InjectMocks
    private DriverAckServiceImpl driverAckService;

    private DriverAck driverAck;
    private DriverAckDTO driverAckDTO;
    private DispatchResponseDTO dispatchResponseDTO;

    @BeforeEach
    void setUp() {
        // Setup Entities for Repository Mocks
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

        // Setup DTO for Input
        driverAckDTO = new DriverAckDTO();
        driverAckDTO.setDispatchID(10L);
        driverAckDTO.setDriverID(20L);
        driverAckDTO.setAckAt(LocalDateTime.now());
        driverAckDTO.setNotes("Acknowledged");

        // Setup DispatchResponseDTO for Service Mocks (Fixing the Type Mismatch)
        DispatchDTO dispatchDTO = new DispatchDTO();
        dispatchDTO.setDispatchID(10L);
        dispatchDTO.setAssignedBy("55"); // Mock Dispatcher ID

        dispatchResponseDTO = new DispatchResponseDTO();
        dispatchResponseDTO.setDispatch(dispatchDTO); // Now uses DispatchDTO, not Dispatch
    }

    // ── INSERT TEST ──────────────────────────────────────────

    @Test
    void insert_ShouldSaveAndReturnDTO() {
        // Stubbing
        when(driverAckRepository.save(any(DriverAck.class))).thenReturn(driverAck);
        when(dispatchService.fetchByID(10L)).thenReturn(dispatchResponseDTO);
        when(roleResolverClient.getUserByRole("Admin")).thenReturn(99L);

        // Execute
        DriverAckDTO result = driverAckService.insert(driverAckDTO);

        // Assertions
        assertNotNull(result);
        assertEquals(1L, result.getAckID());
        assertEquals(10L, result.getDispatchID());

        // Verify Notifications
        // 1 to Dispatcher, 1 to Admin = 2 calls
        verify(notificationClient, times(2)).notifyUser(anyLong(), anyLong(), anyString(), anyString());
        verify(driverAckRepository).save(any(DriverAck.class));
    }

    @Test
    void insert_ShouldThrowException_WhenMandatoryFieldsMissing() {
        DriverAckDTO invalid = new DriverAckDTO();
        assertThrows(IllegalArgumentException.class, () -> driverAckService.insert(invalid));
    }

    // ── FETCH TESTS ──────────────────────────────────────────

    @Test
    void fetchByID_ShouldReturnResponseDTO() {
        when(driverAckRepository.findById(1L)).thenReturn(Optional.of(driverAck));
        when(dispatchService.fetchByID(10L)).thenReturn(dispatchResponseDTO);
        when(driverService.fetchByID(20L)).thenReturn(new DriverDTO());

        DriverAckResponseDTO result = driverAckService.fetchByID(1L);

        assertNotNull(result);
        assertEquals(1L, result.getAckID());
        verify(dispatchService).fetchByID(10L);
    }

    @Test
    void fetchByDispatchID_ShouldReturnList() {
        when(driverAckRepository.findByDispatch_DispatchID(10L)).thenReturn(List.of(driverAck));
        when(dispatchService.fetchByID(10L)).thenReturn(dispatchResponseDTO);
        when(driverService.fetchByID(20L)).thenReturn(new DriverDTO());

        List<DriverAckResponseDTO> result = driverAckService.fetchByDispatchID(10L);

        assertFalse(result.isEmpty());
        assertEquals(1, result.size());
    }

    @Test
    void fetchByDispatchID_ShouldThrowException_WhenEmpty() {
        when(driverAckRepository.findByDispatch_DispatchID(10L)).thenReturn(Collections.emptyList());
        assertThrows(ResourceNotFoundException.class, () -> driverAckService.fetchByDispatchID(10L));
    }

    // ── UPDATE TEST ──────────────────────────────────────────

    @Test
    void updateDriverAck_ShouldUpdateFieldsCorrectly() {
        when(driverAckRepository.findById(1L)).thenReturn(Optional.of(driverAck));
        when(driverAckRepository.save(any(DriverAck.class))).thenAnswer(i -> i.getArgument(0));

        DriverAckDTO updateDTO = new DriverAckDTO();
        updateDTO.setNotes("New Note");
        updateDTO.setDriverID(30L);

        DriverAckDTO result = driverAckService.updateDriverAck(1L, updateDTO);

        assertNotNull(result);
        assertEquals("New Note", result.getNotes());
        // Verify driver ID was updated in the entity passed to save
        verify(driverAckRepository).save(argThat(ack -> ack.getDriver().getDriverID().equals(30L)));
    }

    // ── DELETE TEST ──────────────────────────────────────────

    @Test
    void delete_ShouldInvokeDeleteOnRepository() {
        when(driverAckRepository.findById(1L)).thenReturn(Optional.of(driverAck));
        
        driverAckService.delete(1L);
        
        verify(driverAckRepository, times(1)).delete(driverAck);
    }

    @Test
    void delete_ShouldThrowException_WhenNotFound() {
        when(driverAckRepository.findById(1L)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> driverAckService.delete(1L));
    }
}