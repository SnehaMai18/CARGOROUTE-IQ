package com.example.demo.service;


import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.client.RestTemplate;

import com.example.demo.clients.NotificationClient;
import com.example.demo.clients.RoleResolverClient;
import com.example.demo.clients.TaskClient;
import com.example.demo.dto.HandoverDTO;
import com.example.demo.dto.HandoverResponseDTO;
import com.example.demo.dto.ManifestRequiredResponseDTO;
import com.example.demo.entities.Handover;
import com.example.demo.entities.Manifest;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.HandoverRepository;
import com.example.demo.serviceimpl.HandoverServiceImpl;

@ExtendWith(MockitoExtension.class)
class HandoverServiceImplTest {

    @Mock
    private HandoverRepository handoverRepository;

    @Mock
    private RestTemplate restTemplate;

    // --- Added missing mocks ---
    @Mock
    private NotificationClient notificationClient;

    @Mock
    private RoleResolverClient roleResolverClient;

    @Mock
    private TaskClient taskClient;

    @InjectMocks
    private HandoverServiceImpl handoverService;

    private Handover handover;
    private HandoverDTO handoverDTO;
    private ManifestRequiredResponseDTO manifestDetails;

    @BeforeEach
    void setUp() {
        Manifest manifest = new Manifest();
        manifest.setManifestID(101L);

        handover = new Handover();
        handover.setHandoverID(1L);
        handover.setManifest(manifest);
        handover.setHandedBy("John Doe");
        handover.setReceivedBy("Jane Smith");

        handoverDTO = new HandoverDTO();
        handoverDTO.setManifestID(101L);
        handoverDTO.setHandedBy("John Doe");

        manifestDetails = new ManifestRequiredResponseDTO();
    }

    // ================= CREATE TEST (FIXED) =================

    @Test
    void testCreate_Success() {
        // 1. Mock Repository
        when(handoverRepository.save(any(Handover.class))).thenReturn(handover);

        // 2. Mock RoleResolverClient (This was likely causing your error)
        when(roleResolverClient.getUserByRole("Dispatcher")).thenReturn(500L);
        when(roleResolverClient.getUserByRole("Admin")).thenReturn(999L);

        // 3. Mock NotificationClient (Void methods use doNothing or just don't stub)
        // doNothing() is default for void methods in Mockito

        HandoverDTO result = handoverService.create(handoverDTO);

        assertNotNull(result);
        assertEquals(handover.getHandoverID(), result.getHandoverID());
        
        // Verify interactions
        verify(handoverRepository, times(1)).save(any(Handover.class));
        verify(roleResolverClient).getUserByRole("Dispatcher");
        verify(notificationClient, times(2)).notifyUser(anyLong(), anyLong(), anyString(), anyString());
    }

    // ================= GET BY ID TESTS =================

    @Test
    void testGetById_Success() {
        when(handoverRepository.findById(1L)).thenReturn(Optional.of(handover));
        when(restTemplate.getForObject(anyString(), eq(ManifestRequiredResponseDTO.class)))
            .thenReturn(manifestDetails);

        HandoverResponseDTO result = handoverService.getById(1L);

        assertNotNull(result);
        assertEquals(1L, result.getHandover().getHandoverID());
        verify(handoverRepository).findById(1L);
    }

    @Test
    void testGetById_WithExternalServiceFailure() {
        when(handoverRepository.findById(1L)).thenReturn(Optional.of(handover));
        // Simulate external API crash
        when(restTemplate.getForObject(anyString(), eq(ManifestRequiredResponseDTO.class)))
            .thenThrow(new RuntimeException("Service Down"));

        HandoverResponseDTO result = handoverService.getById(1L);

        assertNotNull(result);
        assertNull(result.getManifestDetails()); 
        assertEquals(1L, result.getHandover().getHandoverID());
    }

    @Test
    void testGetById_NotFound() {
        when(handoverRepository.findById(1L)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> handoverService.getById(1L));
    }

    // ================= UPDATE TESTS =================

    @Test
    void testUpdate_Success() {
        when(handoverRepository.findById(1L)).thenReturn(Optional.of(handover));
        when(handoverRepository.save(any(Handover.class))).thenReturn(handover);

        HandoverDTO updatedInfo = new HandoverDTO();
        updatedInfo.setHandedBy("New Sender");

        HandoverDTO result = handoverService.update(1L, updatedInfo);

        assertNotNull(result);
        verify(handoverRepository).save(handover);
    }

    // ================= DELETE TESTS =================

    @Test
    void testDelete_Success() {
        when(handoverRepository.findById(1L)).thenReturn(Optional.of(handover));
        doNothing().when(handoverRepository).delete(handover);

        handoverService.delete(1L);

        verify(handoverRepository, times(1)).delete(handover);
    }
}