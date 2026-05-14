package com.example.demo.service;
import com.example.demo.dto.LoadDTO;
import com.example.demo.dto.LoadResponseDTO;
import com.example.demo.dto.ManifestDTO;
import com.example.demo.dto.ManifestRequiredResponseDTO;
import com.example.demo.dto.VehicleDTO;
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

    @InjectMocks
    private ManifestServiceImpl manifestService;

    private Manifest manifest;
    private ManifestDTO manifestDTO;

    @BeforeEach
    void setUp() {

        ReflectionTestUtils.setField(
                manifestService,
                "uploadDir",
                System.getProperty("java.io.tmpdir") + "/test-manifests/"
        );

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

    // ─────────────────── CREATE WITH FILE ───────────────────

    @Test
    void createWithFile_ShouldSaveManifestAndReturnDTO() {

        MockMultipartFile manifestPdfFile = new MockMultipartFile(
                "file",
                "manifest.pdf",
                "application/pdf",
                "Sample manifest PDF content".getBytes()
        );

        ManifestServiceImpl spyService = spy(manifestService);

        doReturn("/manifests/sample.pdf")
                .when(spyService).saveFile(any());

        when(manifestRepository.save(any(Manifest.class)))
                .thenReturn(manifest);

        ManifestDTO result =
                spyService.create(manifestDTO, manifestPdfFile);

        assertNotNull(result);
        assertEquals("/manifests/sample.pdf", result.getManifestURI());
        verify(manifestRepository).save(any(Manifest.class));
    }

    @Test
    void createWithFile_ShouldThrowException_WhenFileIsEmpty() {

        MockMultipartFile emptyPdfFile = new MockMultipartFile(
                "file",
                "manifest.pdf",
                "application/pdf",
                new byte[0]
        );

        assertThrows(RuntimeException.class,
                () -> manifestService.create(manifestDTO, emptyPdfFile));
    }

    @Test
    void createWithFile_ShouldThrowException_WhenFileIsNull() {

        assertThrows(RuntimeException.class,
                () -> manifestService.create(manifestDTO, null));
    }

    // ─────────────────── GET BY ID ───────────────────

    @Test
    void getById_ShouldReturnFullResponse_WhenLoadAndVehicleAvailable() {

        LoadDTO loadDTO = new LoadDTO();
        loadDTO.setVehicleID(300L);

        LoadResponseDTO loadResponseDTO = new LoadResponseDTO();
        loadResponseDTO.setLoad(loadDTO);

        when(manifestRepository.findById(1L))
                .thenReturn(Optional.of(manifest));

        when(restTemplate.getForObject(anyString(), eq(LoadResponseDTO.class)))
                .thenReturn(loadResponseDTO);

        when(restTemplate.getForObject(anyString(), eq(VehicleDTO.class)))
                .thenReturn(new VehicleDTO());

        ManifestRequiredResponseDTO result = manifestService.getById(1L);

        assertNotNull(result);
        assertNotNull(result.getManifest());
        assertNotNull(result.getLoad());
        assertNotNull(result.getVehicle());
    }

    @Test
    void getById_ShouldReturnPartialResponse_WhenLoadServiceFails() {

        when(manifestRepository.findById(1L))
                .thenReturn(Optional.of(manifest));

        when(restTemplate.getForObject(anyString(), eq(LoadResponseDTO.class)))
                .thenReturn(null);

        ManifestRequiredResponseDTO result = manifestService.getById(1L);

        assertNotNull(result.getManifest());
        assertNull(result.getLoad());
        assertNull(result.getVehicle());
    }

    @Test
    void getById_ShouldThrowException_WhenManifestNotFound() {

        when(manifestRepository.findById(99L))
                .thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> manifestService.getById(99L));
    }

    // ─────────────────── FALLBACKS ───────────────────

    @Test
    void getByIdFallback_ShouldReturnManifestOnly() {

        when(manifestRepository.findById(1L))
                .thenReturn(Optional.of(manifest));

        ManifestRequiredResponseDTO response =
                manifestService.getByIdFallback(1L, new RuntimeException());

        assertNotNull(response.getManifest());
        assertNull(response.getLoad());
        assertNull(response.getVehicle());
    }

    @Test
    void getAllFallback_ShouldReturnPartialResponses() {

        when(manifestRepository.findAll())
                .thenReturn(List.of(manifest));

        List<ManifestRequiredResponseDTO> responses =
                manifestService.getAllFallback(new RuntimeException());

        assertEquals(1, responses.size());
        assertNull(responses.get(0).getLoad());
    }

    // ─────────────────── UPDATE ───────────────────

    @Test
    void update_ShouldModifyFields_WhenManifestExists() {

        when(manifestRepository.findById(1L))
                .thenReturn(Optional.of(manifest));

        when(manifestRepository.save(any(Manifest.class)))
                .thenReturn(manifest);

        ManifestDTO updateDTO = new ManifestDTO();
        updateDTO.setWarehouseID(999L);
        updateDTO.setItemsJSON("{\"item\":\"Pallet\"}");
        updateDTO.setManifestURI("/manifests/updated.pdf");

        ManifestDTO result = manifestService.update(1L, updateDTO);

        assertNotNull(result);
        verify(manifestRepository).save(any(Manifest.class));
    }

    // ─────────────────── DELETE ───────────────────

    @Test
    void delete_ShouldDeleteManifest_WhenExists() {

        when(manifestRepository.existsById(1L)).thenReturn(true);

        manifestService.delete(1L);

        verify(manifestRepository).deleteById(1L);
    }

    @Test
    void delete_ShouldThrowException_WhenManifestDoesNotExist() {

        when(manifestRepository.existsById(99L)).thenReturn(false);

        assertThrows(ResourceNotFoundException.class,
                () -> manifestService.delete(99L));
    }
}
