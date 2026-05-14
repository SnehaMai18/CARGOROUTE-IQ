package com.example.demo.service;
import com.example.demo.clients.NotificationClient;
import com.example.demo.clients.TaskClient;
import com.example.demo.dto.DriverDTO;
import com.example.demo.dto.VehicleAvailabilityDTO;
import com.example.demo.dto.VehicleDTO;
import com.example.demo.entity.Vehicle;
import com.example.demo.entity.VehicleAvailability;
import com.example.demo.entity.enums.VehicleStatus;
import com.example.demo.entity.enums.VehicleType;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.VehicleRepository;
import com.example.demo.serviceImpl.VehicleServiceImpl;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VehicleServiceImplTest {

    @Mock
    private VehicleRepository vehicleRepository;

    @Mock
    private RestTemplate restTemplate;

    @Mock
    private NotificationClient notificationClient;

    @Mock
    private TaskClient taskClient;

    @InjectMocks
    private VehicleServiceImpl service;

    private Vehicle vehicle;

    @BeforeEach
    void setup() {
        vehicle = new Vehicle();
        vehicle.setVehicleID(1L);
        vehicle.setRegNumber("TN01AB1234");
        vehicle.setType(VehicleType.TRUCK);
        vehicle.setStatus(VehicleStatus.ACTIVE);
        vehicle.setDriverID(99L);
        vehicle.setMaxWeightKg(1000.0);
        vehicle.setMaxVolumeM3(20.0);
        vehicle.setLastMaintenanceAt(LocalDateTime.now());

        VehicleAvailability availability = new VehicleAvailability();
        availability.setAvailID(10L);
        availability.setStatus("AVAILABLE");
        availability.setVehicle(vehicle);

        vehicle.getAvailabilities().add(availability);
    }

    // ───────────── CREATE ─────────────

    @Test
    void createVehicle_shouldSaveAndReturnDTO() {
        when(vehicleRepository.save(any(Vehicle.class)))
                .thenReturn(vehicle);

        VehicleDTO input = new VehicleDTO();
        input.setRegNumber("TN01AB1234");

        VehicleDTO result = service.createVehicle(input);

        assertNotNull(result);
        verify(vehicleRepository).save(any(Vehicle.class));
    }

    // ───────────── UPDATE ─────────────

    @Test
    void updateVehicle_shouldReassignDriverAndNotify() {
        when(vehicleRepository.findById(1L))
                .thenReturn(Optional.of(vehicle));
        when(vehicleRepository.save(any(Vehicle.class)))
                .thenReturn(vehicle);

        VehicleDTO updateDto = new VehicleDTO();
        updateDto.setDriverID(77L);
        updateDto.setRegNumber("TN01AB9999");
        updateDto.setType(VehicleType.TRUCK);
        updateDto.setStatus(VehicleStatus.MAINTENANCE);

        VehicleDTO result = service.updateVehicle(1L, updateDto);

        assertNotNull(result);

        verify(notificationClient).notifyUser(
                eq(77L),
                eq(1L),
                contains("reassigned"),
                anyString()
        );

        verify(taskClient).createTask(
                eq(77L),
                eq(1L),
                anyString(),
                isNull()
        );
    }

    @Test
    void updateVehicle_shouldThrowWhenVehicleNotFound() {
        when(vehicleRepository.findById(99L))
                .thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> service.updateVehicle(99L, new VehicleDTO()));
    }

    // ───────────── GET ALL ─────────────

    @Test
    void getAllVehicles_shouldReturnList() {
        when(vehicleRepository.findAll())
                .thenReturn(List.of(vehicle));

        List<VehicleDTO> result = service.getAllVehicles();

        assertEquals(1, result.size());
        verify(vehicleRepository).findAll();
    }

    // ───────────── GET BY ID (ENRICHED) ─────────────

    @Test
    void getVehicleById_shouldIncludeDriverDetails() {
        when(vehicleRepository.findById(1L))
                .thenReturn(Optional.of(vehicle));

        DriverDTO driverDTO = new DriverDTO();
        driverDTO.setDriverID(99L);

        when(restTemplate.getForObject(anyString(), eq(DriverDTO.class)))
                .thenReturn(driverDTO);

        VehicleDTO dto = service.getVehicleById(1L);

        assertNotNull(dto.getDriver());
        assertEquals(99L, dto.getDriver().getDriverID());
    }

    // ───────────── DELETE ─────────────

    @Test
    void deleteVehicle_shouldNotifyDriverAndDelete() {
        when(vehicleRepository.findById(1L))
                .thenReturn(Optional.of(vehicle));

        service.deleteVehicle(1L);

        verify(notificationClient).notifyUser(
                eq(99L),
                eq(1L),
                contains("no longer available"),
                anyString()
        );

        verify(taskClient).createTask(
                eq(99L),
                eq(1L),
                anyString(),
                isNull()
        );

        verify(vehicleRepository).delete(vehicle);
    }

    // ───────────── GET AVAILABILITIES (REMOTE) ─────────────

    @Test
    void getVehicleAvailabilities_shouldReturnList() {
        VehicleAvailabilityDTO availabilityDTO = new VehicleAvailabilityDTO();
        availabilityDTO.setAvailID(10L);

        when(restTemplate.exchange(
                anyString(),
                eq(HttpMethod.GET),
                isNull(),
                any(ParameterizedTypeReference.class)))
                .thenReturn(ResponseEntity.ok(List.of(availabilityDTO)));

        List<VehicleAvailabilityDTO> result =
                service.getVehicleAvailabilities(1L);

        assertEquals(1, result.size());
    }

    // ───────────── FALLBACKS ─────────────

    @Test
    void driverFallback_shouldReturnVehicleWithoutDriver() {
        when(vehicleRepository.findById(1L))
                .thenReturn(Optional.of(vehicle));

        VehicleDTO dto =
                service.driverFallback(1L, new RuntimeException("driver service down"));

        assertNotNull(dto);
        assertNull(dto.getDriver());
    }

    @Test
    void fleetFallback_shouldReturnEmptyList() {
        List<VehicleAvailabilityDTO> result =
                service.fleetFallback(1L, new RuntimeException("fleet service down"));

        assertTrue(result.isEmpty());
    }
}