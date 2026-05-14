package com.example.demo.service;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.example.demo.dto.DriverDTO;
import com.example.demo.entities.Driver;
import com.example.demo.entities.enums.DriverStatus;
import com.example.demo.exception.BadRequestException;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.DriverRepository;
import com.example.demo.serviceimpl.DriverServiceImpl;

@ExtendWith(MockitoExtension.class)
class DriverServiceImplTest {

    @Mock
    private DriverRepository driverRepository;

    @InjectMocks
    private DriverServiceImpl driverService;

    // ---------- Helper ----------
    private Driver mockDriver() {
        Driver driver = new Driver();
        driver.setDriverID(1L);
        driver.setName("Sai");
        driver.setLicenseNo("LIC123");
        driver.setContactInfo("Chennai");
        driver.setMobileNumber("1234567890");
        driver.setStatus(DriverStatus.AVAILABLE);
        return driver;
    }

    // ---------- INSERT ----------
    @Test
    void insert_shouldSaveDriver_whenValid() {
        DriverDTO dto = new DriverDTO();
        dto.setName("Sai");
        dto.setLicenseNo("LIC123");
        dto.setStatus(DriverStatus.AVAILABLE);

        // Capture the entity to ensure mapping is correct
        when(driverRepository.save(any(Driver.class))).thenReturn(mockDriver());

        DriverDTO result = driverService.insert(dto);

        assertNotNull(result);
        assertEquals("Sai", result.getName());
        // Verify the repository received the correct mapped data
        verify(driverRepository).save(argThat(driver -> 
            driver.getName().equals("Sai") && 
            driver.getLicenseNo().equals("LIC123")
        ));
    }

    @Test
    void insert_shouldThrowException_whenNameIsNull() {
        DriverDTO dto = new DriverDTO();

        assertThrows(BadRequestException.class,
                () -> driverService.insert(dto));
    }

    // ---------- FETCH BY ID ----------
    @Test
    void fetchByID_shouldReturnDriver_whenExists() {
        when(driverRepository.findById(1L))
                .thenReturn(Optional.of(mockDriver()));

        DriverDTO dto = driverService.fetchByID(1L);

        assertEquals(1L, dto.getDriverID());
        assertEquals("Sai", dto.getName());
    }

    @Test
    void fetchByID_shouldThrowException_whenNotFound() {
        when(driverRepository.findById(1L))
                .thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> driverService.fetchByID(1L));
    }

    // ---------- FETCH BY STATUS ----------
    @Test
    void fetchByStatus_shouldReturnList() {
        when(driverRepository.findByStatus(DriverStatus.AVAILABLE))
                .thenReturn(Arrays.asList(mockDriver()));

        List<DriverDTO> result =
                driverService.fetchByStatus(DriverStatus.AVAILABLE);

        assertEquals(1, result.size());
        assertEquals(DriverStatus.AVAILABLE, result.get(0).getStatus());
    }

    // ---------- FETCH ALL ----------
    @Test
    void fetchAll_shouldReturnAllDrivers() {
        when(driverRepository.findAll())
                .thenReturn(Arrays.asList(mockDriver()));

        List<DriverDTO> result = driverService.fetchAll();

        assertEquals(1, result.size());
        verify(driverRepository).findAll();
    }

    // ---------- UPDATE ----------
    @Test
    void updateDriver_shouldUpdateAllowedFieldsOnly() {
        Driver existing = mockDriver();

        when(driverRepository.findById(1L)).thenReturn(Optional.of(existing));
        // Use thenAnswer to return the modified object being saved
        when(driverRepository.save(any(Driver.class))).thenAnswer(i -> i.getArgument(0));

        DriverDTO updateDTO = new DriverDTO();
        updateDTO.setMobileNumber("9999999999");
        updateDTO.setStatus(DriverStatus.ON_ROUTE);

        DriverDTO updated = driverService.updateDriver(1L, updateDTO);

        assertEquals("9999999999", updated.getMobileNumber());
        assertEquals(DriverStatus.ON_ROUTE, updated.getStatus());
        
        // Check that original fields are preserved (Important for partial updates)
        assertEquals("Sai", updated.getName());
        assertEquals("LIC123", updated.getLicenseNo());
    }

    @Test
    void updateDriver_shouldThrowException_whenNotFound() {
        when(driverRepository.findById(1L))
                .thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> driverService.updateDriver(1L, new DriverDTO()));
    }

    // ---------- DELETE ----------
    @Test
    void delete_shouldDeleteDriver_whenExists() {
        when(driverRepository.findById(1L))
                .thenReturn(Optional.of(mockDriver()));

        driverService.delete(1L);

        verify(driverRepository).delete(any(Driver.class));
    }

    @Test
    void delete_shouldThrowException_whenNotFound() {
        when(driverRepository.findById(1L))
                .thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> driverService.delete(1L));
    }
}