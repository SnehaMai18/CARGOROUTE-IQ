package com.example.demo.service;

import com.example.demo.clients.NotificationClient;
import com.example.demo.clients.RoleResolverClient;
import com.example.demo.clients.TaskClient;
import com.example.demo.dto.DispatchDTO;
import com.example.demo.dto.DispatchResponseDTO;
import com.example.demo.dto.LoadDTO;
import com.example.demo.dto.LoadResponseDTO;
import com.example.demo.dto.VehicleDTO;
import com.example.demo.entities.Dispatch;
import com.example.demo.entities.enums.DispatchStatus;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.DispatchRepository;
import com.example.demo.serviceimpl.DispatchServiceImpl;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DispatchServiceImplTest {

    @Mock
    private DispatchRepository dispatchRepository;

    @Mock
    private RestTemplate restTemplate;

    // ✅ ADDED MISSING MOCKS
    @Mock
    private NotificationClient notificationClient;

    @Mock
    private TaskClient taskClient;

    @Mock
    private RoleResolverClient roleResolverClient;

    @InjectMocks
    private DispatchServiceImpl dispatchService;

    private Dispatch dispatch;
    private DispatchDTO dispatchDTO;

    @BeforeEach
    void setUp() {
        dispatch = new Dispatch();
        dispatch.setDispatchID(1L);
        dispatch.setLoadID(100L);
        dispatch.setAssignedDriverID(200L);
        dispatch.setAssignedBy("Admin");
        dispatch.setAssignedAt(LocalDateTime.now());
        dispatch.setStatus(DispatchStatus.ASSIGNED);

        dispatchDTO = new DispatchDTO();
        dispatchDTO.setLoadID(100L);
        dispatchDTO.setAssignedDriverID(200L);
        dispatchDTO.setAssignedBy("Admin");
        dispatchDTO.setStatus(DispatchStatus.ASSIGNED);
    }

    /* ───────────────── INSERT ───────────────── */

    @Test
    void insert_ShouldSaveAndTriggerExternalClients() {
        // Mock role resolver values
        when(roleResolverClient.getUserByRole("Driver")).thenReturn(200L);
        when(roleResolverClient.getUserByRole("Admin")).thenReturn(999L);
        
        // Mock repository save
        when(dispatchRepository.save(any(Dispatch.class))).thenReturn(dispatch);

        DispatchDTO result = dispatchService.insert(dispatchDTO);

        assertNotNull(result);
        assertEquals(100L, result.getLoadID());
        
        // Verify notifications and tasks were triggered
        verify(roleResolverClient, times(2)).getUserByRole(anyString());
        verify(taskClient).createTask(eq(200L), any(), anyString(), any());
        verify(notificationClient, times(2)).notifyUser(anyLong(), any(), anyString(), anyString());
        verify(dispatchRepository).save(any(Dispatch.class));
    }

    /* ───────────────── FETCH BY ID ───────────────── */

    @Test
    void fetchByID_ShouldReturnDispatchWithLoadAndVehicle() {
        LoadDTO loadDTO = new LoadDTO();
        loadDTO.setVehicleID(300L);

        LoadResponseDTO loadResponse = new LoadResponseDTO();
        loadResponse.setLoad(loadDTO);

        when(dispatchRepository.findById(1L)).thenReturn(Optional.of(dispatch));
        
        // Mock RestTemplate calls
        when(restTemplate.getForObject(contains("getLoad"), eq(LoadResponseDTO.class)))
                .thenReturn(loadResponse);

        DispatchResponseDTO result = dispatchService.fetchByID(1L);

        assertNotNull(result);
        assertEquals(100L, result.getDispatch().getLoadID());
        assertNotNull(result.getLoad());
    }

    /* ───────────────── FIND BY LOAD ID ───────────────── */

    @Test
    void findByLoadID_ShouldReturnDispatch() {
        when(dispatchRepository.findByLoadID(100L)).thenReturn(dispatch);
        when(restTemplate.getForObject(anyString(), eq(LoadResponseDTO.class)))
                .thenReturn(new LoadResponseDTO());

        DispatchResponseDTO result = dispatchService.findByLoadID(100L);

        assertNotNull(result);
        assertEquals(100L, result.getDispatch().getLoadID());
    }

    /* ───────────────── UPDATE ───────────────── */

    @Test
    void updateDispatch_ShouldHandleReassignment() {
        when(dispatchRepository.findById(1L)).thenReturn(Optional.of(dispatch));
        when(dispatchRepository.save(any(Dispatch.class))).thenAnswer(i -> i.getArgument(0));

        DispatchDTO updateDTO = new DispatchDTO();
        updateDTO.setAssignedDriverID(300L); // New Driver
        updateDTO.setStatus(DispatchStatus.COMPLETED);

        DispatchDTO result = dispatchService.updateDispatch(1L, updateDTO);

        assertEquals(300L, result.getAssignedDriverID());
        
        // Verify logic for reassignment notification
        verify(notificationClient).notifyUser(eq(200L), any(), contains("reassigned"), anyString()); // Old Driver
        verify(notificationClient).notifyUser(eq(300L), any(), contains("reassigned"), anyString()); // New Driver
        verify(taskClient).createTask(eq(300L), any(), anyString(), any());
    }

    /* ───────────────── DELETE ───────────────── */

    @Test
    void delete_ShouldDeleteDispatch() {
        when(dispatchRepository.findById(1L)).thenReturn(Optional.of(dispatch));

        dispatchService.delete(1L);

        verify(dispatchRepository).delete(dispatch);
    }
}