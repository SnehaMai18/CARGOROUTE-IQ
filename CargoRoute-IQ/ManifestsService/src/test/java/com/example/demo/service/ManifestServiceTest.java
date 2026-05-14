package com.example.demo.service;

import com.example.demo.clients.NotificationClient;
import com.example.demo.clients.RoleResolverClient;
import com.example.demo.clients.TaskClient;
import com.example.demo.dto.*;
import com.example.demo.entities.Manifest;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.ManifestRepository;
import com.example.demo.serviceimpl.ManifestServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ManifestServiceImplTest {

    @Mock
    private ManifestRepository manifestRepository;

    @Mock
    private RestTemplate restTemplate;

    // ✅ ADDED NEW MOCKS
    @Mock
    private NotificationClient notificationClient;

    @Mock
    private TaskClient taskClient;

    @Mock
    private RoleResolverClient roleResolverClient;

    @InjectMocks
    private ManifestServiceImpl manifestService;

    private Manifest manifest;
    private ManifestDTO manifestDTO;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(manifestService, "uploadDir", System.getProperty("java.io.tmpdir") + "/test-manifests/");

        manifest = new Manifest();
        manifest.setManifestID(1L);
        manifest.setLoadID(100L);
        manifest.setWarehouseID(200L);
        manifest.setItemsJSON("{\"item\":\"Box\"}");
        manifest.setCreatedBy("Admin");
        manifest.setCreatedAt(LocalDateTime.now());
        manifest.setManifestURI("/manifests/sample.pdf");

        manifestDTO = new ManifestDTO();
        manifestDTO.setLoadID(100L);
        manifestDTO.setWarehouseID(200L);
        manifestDTO.setItemsJSON("{\"item\":\"Box\"}");
        manifestDTO.setCreatedBy("Admin");
    }

    // ─────────────────── CREATE & FILE OPS ───────────────────

    @Test
    void create_ShouldSaveManifestAndTriggerNotifications() {
        // Arrange
        MockMultipartFile file = new MockMultipartFile("file", "test.pdf", "text/plain", "content".getBytes());
        
        // Mock the internal role lookup
        when(roleResolverClient.getUserByRole("Admin")).thenReturn(999L);
        when(manifestRepository.save(any(Manifest.class))).thenReturn(manifest);
        
        // Act
        ManifestDTO result = manifestService.create(manifestDTO, file);
        
        // Assert
        assertNotNull(result);
        verify(manifestRepository).save(any(Manifest.class));
        // Verify both notifications (Warehouse user and Admin)
        verify(notificationClient, times(2)).notifyUser(anyLong(), anyLong(), anyString(), anyString());
    }

    // ─────────────────── UPDATE & DELETE ───────────────────

    @Test
    void update_ShouldUpdateFieldsAndNotifyRoleBasedUsers() {
        // Arrange
        when(manifestRepository.findById(1L)).thenReturn(Optional.of(manifest));
        when(manifestRepository.save(any(Manifest.class))).thenReturn(manifest);
        
        // Mock the roles required in the update method
        when(roleResolverClient.getUserByRole("Dispatcher")).thenReturn(777L);
        when(roleResolverClient.getUserByRole("Driver")).thenReturn(888L);

        ManifestDTO updateDTO = new ManifestDTO();
        updateDTO.setWarehouseID(500L);
        
        // Act
        ManifestDTO result = manifestService.update(1L, updateDTO);
        
        // Assert
        assertNotNull(result);
        assertEquals(1L, result.getManifestID());
        // Verify notification to Dispatcher/Admin and Task to Driver
        verify(notificationClient, atLeastOnce()).notifyUser(eq(777L), anyLong(), anyString(), anyString());
        verify(taskClient).createTask(eq(888L), anyLong(), anyString(), any());
    }

    // ─────────────────── FETCHING & FALLBACKS (NO CHANGES NEEDED) ───────────────────

    @Test
    void getById_ShouldReturnFullResponse() {
        LoadResponseDTO loadResponse = new LoadResponseDTO();
        loadResponse.setLoad(new LoadDTO());
        loadResponse.getLoad().setVehicleID(300L);

        when(manifestRepository.findById(1L)).thenReturn(Optional.of(manifest));
        when(restTemplate.getForObject(contains("getLoad"), eq(LoadResponseDTO.class))).thenReturn(loadResponse);
        when(restTemplate.getForObject(contains("getVehicle"), eq(VehicleDTO.class))).thenReturn(new VehicleDTO());

        ManifestRequiredResponseDTO result = manifestService.getById(1L);
        assertNotNull(result.getVehicle());
    }

    @Test
    void delete_ShouldInvokeRepository() {
        when(manifestRepository.existsById(1L)).thenReturn(true);
        manifestService.delete(1L);
        verify(manifestRepository).deleteById(1L);
    }
    
    @Test
    void getByLoadID_ShouldReturnResponse() {
        when(manifestRepository.findByLoadID(100L)).thenReturn(manifest);
        ManifestRequiredResponseDTO result = manifestService.getByLoadID(100L);
        assertEquals(100L, result.getManifest().getLoadID());
    }
}