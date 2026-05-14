package com.example.demo.serviceImpl;
import org.springframework.core.ParameterizedTypeReference;


import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;

import com.example.demo.dto.DriverDTO;
import com.example.demo.dto.VehicleAvailabilityDTO;
import com.example.demo.dto.VehicleDTO;
import com.example.demo.entity.Vehicle;
import com.example.demo.entity.VehicleAvailability;
import com.example.demo.entity.enums.VehicleType;
import com.example.demo.repository.VehicleRepository;

@ExtendWith(MockitoExtension.class)
class VehicleServiceImplTest {

    @Mock
    private VehicleRepository vehicleRepository;

    @Mock
    private RestTemplate restTemplate;

    @InjectMocks
    private VehicleServiceImpl vehicleService;

    @Test
    void shouldCreateVehicleAndReturnDto() {
        VehicleDTO dto = new VehicleDTO();
        dto.setRegNumber("ABC-123");
        dto.setType(VehicleType.TRUCK);
        dto.setMaxWeightKg(12000.0);
        dto.setMaxVolumeM3(40.0);
        dto.setStatus("AVAILABLE");
        dto.setLastMaintenanceAt(LocalDateTime.of(2026, 4, 10, 10, 0));

        when(vehicleRepository.save(any(Vehicle.class))).thenAnswer(invocation -> {
            Vehicle saved = invocation.getArgument(0);
            saved.setVehicleID(1L);
            return saved;
        });

        VehicleDTO result = vehicleService.createVehicle(dto);

        assertNotNull(result);
        assertEquals(1L, result.getVehicleID());
        assertEquals("ABC-123", result.getRegNumber());
        assertEquals(VehicleType.TRUCK, result.getType());
        assertEquals("AVAILABLE", result.getStatus());
        verify(vehicleRepository, times(1)).save(any(Vehicle.class));
    }

    @Test
    void shouldGetVehicleByIdAndEnrichDriver() {
        Vehicle vehicle = new Vehicle();
        vehicle.setVehicleID(2L);
        vehicle.setRegNumber("XYZ-789");
        vehicle.setType(VehicleType.VAN);
        vehicle.setMaxWeightKg(5000.0);
        vehicle.setMaxVolumeM3(20.0);
        vehicle.setStatus("IN_SERVICE");
        vehicle.setLastMaintenanceAt(LocalDateTime.of(2026, 1, 5, 9, 30));
        vehicle.setDriverID(100L);

        VehicleAvailability availability = new VehicleAvailability();
        availability.setAvailID(10L);
        availability.setDate(LocalDateTime.of(2026, 4, 11, 0, 0));
        availability.setStartTime(LocalDateTime.of(2026, 4, 11, 8, 0));
        availability.setEndTime(LocalDateTime.of(2026, 4, 11, 18, 0));
        availability.setReasonNote("Maintenance window");
        availability.setStatus("OPEN");
        availability.setVehicle(vehicle);
        vehicle.getAvailabilities().add(availability);

        DriverDTO driverDTO = new DriverDTO();
        driverDTO.setDriverID(100L);
        driverDTO.setName("Test Driver");

        when(vehicleRepository.findById(2L)).thenReturn(Optional.of(vehicle));
        when(restTemplate.getForObject("http://DISPATCH-SERVICE/cargoRoute/drivers/getDriverByDriverId/100", DriverDTO.class)).thenReturn(driverDTO);

        VehicleDTO result = vehicleService.getVehicleById(2L);

        assertNotNull(result);
        assertEquals(2L, result.getVehicleID());
        assertNotNull(result.getDriver());
        assertEquals(100L, result.getDriver().getDriverID());
        assertEquals(1, result.getAvailabilities().size());
        verify(vehicleRepository, times(1)).findById(2L);
        verify(restTemplate, times(1)).getForObject("http://DISPATCH-SERVICE/cargoRoute/drivers/getDriverByDriverId/100", DriverDTO.class);
    }

//    @Test
//    void shouldReturnVehicleAvailabilitiesFromRemoteService() {
//        VehicleAvailabilityDTO dto = new VehicleAvailabilityDTO();
//        dto.setAvailID(11L);
//        dto.setDate(LocalDateTime.of(2026, 4, 20, 0, 0));
//        dto.setStartTime(LocalDateTime.of(2026, 4, 20, 8, 0));
//        dto.setEndTime(LocalDateTime.of(2026, 4, 20, 17, 0));
//        dto.setReasonNote("Route planning");
//        dto.setStatus("CONFIRMED");
//
//        when(restTemplate.exchange(
//                eq("http://FLEET-SERVICE/CargoRoute/vehicleAvailability/vehicle/2"),
//                eq(HttpMethod.GET),
//                isNull(),
//                any(ParameterizedTypeReference.class))
//        ).thenReturn(ResponseEntity.ok(List.of(dto)));
//
//        List<VehicleAvailabilityDTO> result = vehicleService.getVehicleAvailabilities(2L);
//
//        assertNotNull(result);
//        assertEquals(1, result.size());
//        assertEquals(11L, result.get(0).getAvailID());
//        verify(restTemplate, times(1)).exchange(
//                eq("http://FLEET-SERVICE/CargoRoute/vehicleAvailability/vehicle/2"),
//                eq(HttpMethod.GET),
//                isNull(),
//                any(ParameterizedTypeReference.class));
//    }


    @Test
    void shouldUpdateVehicleAndReturnUpdatedDto() {
        Vehicle existing = new Vehicle();
        existing.setVehicleID(3L);
        existing.setRegNumber("OLD-123");
        existing.setType(VehicleType.TRUCK);
        existing.setMaxWeightKg(10000.0);
        existing.setMaxVolumeM3(30.0);
        existing.setStatus("AVAILABLE");
        existing.setLastMaintenanceAt(LocalDateTime.of(2025, 12, 1, 8, 0));

        VehicleDTO updateDto = new VehicleDTO();
        updateDto.setRegNumber("NEW-456");
        updateDto.setType(VehicleType.TRUCK);
        updateDto.setMaxWeightKg(14000.0);
        updateDto.setMaxVolumeM3(45.0);
        updateDto.setStatus("MAINTENANCE");
        updateDto.setLastMaintenanceAt(LocalDateTime.of(2026, 4, 1, 12, 0));

        when(vehicleRepository.findById(3L)).thenReturn(Optional.of(existing));
        when(vehicleRepository.save(any(Vehicle.class))).thenAnswer(invocation -> invocation.getArgument(0));

        VehicleDTO result = vehicleService.updateVehicle(3L, updateDto);

        assertNotNull(result);
        assertEquals("NEW-456", result.getRegNumber());
        assertEquals(14000.0, result.getMaxWeightKg());
        assertEquals("MAINTENANCE", result.getStatus());
    }

    @Test
    void shouldDeleteVehicleWhenExists() {
        Vehicle existing = new Vehicle();
        existing.setVehicleID(4L);
        when(vehicleRepository.findById(4L)).thenReturn(Optional.of(existing));

        vehicleService.deleteVehicle(4L);

        verify(vehicleRepository, times(1)).delete(existing);
    }
}
