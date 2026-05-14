package com.example.demo.service;
import com.example.demo.entity.Vehicle;
import com.example.demo.entity.VehicleAvailability;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.VehicleAvailabilityRepository;
import com.example.demo.repository.VehicleRepository;
import com.example.demo.serviceImpl.VehicleAvailabilityServiceImpl;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VehicleAvailabilityServiceImplTest {

    @Mock
    private VehicleAvailabilityRepository availabilityRepo;

    @Mock
    private VehicleRepository vehicleRepo;

    @InjectMocks
    private VehicleAvailabilityServiceImpl service;

    private Vehicle vehicle;
    private VehicleAvailability availability;

    @BeforeEach
    void setup() {
        vehicle = new Vehicle();
        vehicle.setVehicleID(10L);

        availability = new VehicleAvailability();
        availability.setAvailID(1L);
        availability.setVehicle(vehicle);
        availability.setDate(LocalDateTime.now());
        availability.setStartTime(LocalDateTime.now().plusHours(1));
        availability.setEndTime(LocalDateTime.now().plusHours(3));
        availability.setReasonNote("Maintenance");
        availability.setStatus("UNAVAILABLE");
    }

    // ─────────── SAVE ───────────

    @Test
    void save_shouldPersistAvailability() {
        when(vehicleRepo.findById(10L)).thenReturn(Optional.of(vehicle));
        when(availabilityRepo.save(any())).thenReturn(availability);

        VehicleAvailability saved = service.save(availability);

        assertNotNull(saved);
        assertEquals("UNAVAILABLE", saved.getStatus());

        verify(vehicleRepo).findById(10L);
        verify(availabilityRepo).save(any(VehicleAvailability.class));
    }

    @Test
    void save_shouldThrow_whenVehicleNotFound() {
        when(vehicleRepo.findById(10L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> service.save(availability));

        verify(availabilityRepo, never()).save(any());
    }

    @Test
    void save_shouldThrow_whenEndTimeBeforeStartTime() {
        availability.setEndTime(LocalDateTime.now());

        when(vehicleRepo.findById(10L)).thenReturn(Optional.of(vehicle));

        assertThrows(IllegalArgumentException.class,
                () -> service.save(availability));

        verify(availabilityRepo, never()).save(any());
    }

    // ─────────── GET ALL ───────────

    @Test
    void getAll_shouldReturnList() {
        when(availabilityRepo.findAll()).thenReturn(List.of(availability));

        List<VehicleAvailability> list = service.getAll();

        assertEquals(1, list.size());
        verify(availabilityRepo).findAll();
    }

    // ─────────── GET BY ID ───────────

    @Test
    void getById_shouldReturnAvailability() {
        when(availabilityRepo.findById(1L))
                .thenReturn(Optional.of(availability));

        VehicleAvailability result = service.getById(1L);

        assertEquals(1L, result.getAvailID());
    }

    @Test
    void getById_shouldThrow_whenNotFound() {
        when(availabilityRepo.findById(99L))
                .thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> service.getById(99L));
    }

    // ─────────── UPDATE ───────────

    @Test
    void update_shouldModifyExistingAvailability() {
        when(availabilityRepo.findById(1L))
                .thenReturn(Optional.of(availability));
        when(vehicleRepo.findById(10L))
                .thenReturn(Optional.of(vehicle));
        when(availabilityRepo.save(any()))
                .thenReturn(availability);

        availability.setStatus("AVAILABLE");

        VehicleAvailability updated =
                service.update(1L, availability);

        assertEquals("AVAILABLE", updated.getStatus());
        verify(availabilityRepo).save(any());
    }

    @Test
    void update_shouldThrow_whenVehicleNotFound() {
        when(availabilityRepo.findById(1L))
                .thenReturn(Optional.of(availability));
        when(vehicleRepo.findById(10L))
                .thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> service.update(1L, availability));
    }

    // ─────────── DELETE ───────────

    @Test
    void delete_shouldRemoveAvailability() {
        when(availabilityRepo.findById(1L))
                .thenReturn(Optional.of(availability));

        service.delete(1L);

        verify(availabilityRepo).delete(availability);
    }

    // ─────────── GET BY VEHICLE ───────────

    @Test
    void getByVehicleId_shouldReturnList() {
        when(availabilityRepo.findByVehicle_VehicleID(10L))
                .thenReturn(List.of(availability));

        List<VehicleAvailability> list =
                service.getByVehicleId(10L);

        assertEquals(1, list.size());
        verify(availabilityRepo).findByVehicle_VehicleID(10L);
    }
}
