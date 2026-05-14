package com.example.demo.repository;

import static org.junit.jupiter.api.Assertions.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import com.example.demo.entity.Vehicle;
import com.example.demo.entity.enums.VehicleType;

@DataJpaTest
class VehicleRepositoryTest {

    @Autowired
    private VehicleRepository vehicleRepository;

    private Vehicle vehicle;

    @BeforeEach
    void setUp() {
        vehicle = new Vehicle();
        vehicle.setRegNumber("ABC-123");
        vehicle.setType(VehicleType.TRUCK);
        vehicle.setMaxWeightKg(12000.0);
        vehicle.setMaxVolumeM3(40.0);
        vehicle.setStatus("AVAILABLE");
        vehicle.setLastMaintenanceAt(LocalDateTime.of(2026, 4, 10, 10, 0));
    }

    @Test
    void testSaveVehicle_Success() {
        Vehicle savedVehicle = vehicleRepository.save(vehicle);

        assertNotNull(savedVehicle);
        assertNotNull(savedVehicle.getVehicleID());
        assertEquals("ABC-123", savedVehicle.getRegNumber());
        assertEquals(VehicleType.TRUCK, savedVehicle.getType());
        assertEquals("AVAILABLE", savedVehicle.getStatus());
    }

    @Test
    void testFindById_Success() {
        Vehicle savedVehicle = vehicleRepository.save(vehicle);

        Optional<Vehicle> retrievedVehicle = vehicleRepository.findById(savedVehicle.getVehicleID());

        assertTrue(retrievedVehicle.isPresent());
        assertEquals("ABC-123", retrievedVehicle.get().getRegNumber());
        assertEquals(VehicleType.TRUCK, retrievedVehicle.get().getType());
    }

    @Test
    void testFindById_NotFound() {
        Optional<Vehicle> retrievedVehicle = vehicleRepository.findById(9999L);

        assertFalse(retrievedVehicle.isPresent());
    }

    @Test
    void testFindByRegNumber_Success() {
        vehicleRepository.save(vehicle);

        Vehicle retrievedVehicle = vehicleRepository.findByRegNumber("ABC-123");

        assertNotNull(retrievedVehicle);
        assertEquals("ABC-123", retrievedVehicle.getRegNumber());
        assertEquals(VehicleType.TRUCK, retrievedVehicle.getType());
    }

    @Test
    void testFindByRegNumber_NotFound() {
        Vehicle retrievedVehicle = vehicleRepository.findByRegNumber("NONEXISTENT");

        assertNull(retrievedVehicle);
    }

    @Test
    void testFindAll_Success() {
        Vehicle vehicle2 = new Vehicle();
        vehicle2.setRegNumber("XYZ-789");
        vehicle2.setType(VehicleType.VAN);
        vehicle2.setMaxWeightKg(5000.0);
        vehicle2.setMaxVolumeM3(20.0);
        vehicle2.setStatus("IN_SERVICE");

        vehicleRepository.save(vehicle);
        vehicleRepository.save(vehicle2);

        List<Vehicle> vehicles = vehicleRepository.findAll();

        assertEquals(2, vehicles.size());
    }

    @Test
    void testFindAll_EmptyDatabase() {
        List<Vehicle> vehicles = vehicleRepository.findAll();

        assertTrue(vehicles.isEmpty());
    }

    @Test
    void testUpdateVehicle_Success() {
        Vehicle savedVehicle = vehicleRepository.save(vehicle);

        savedVehicle.setStatus("MAINTENANCE");
        savedVehicle.setRegNumber("ABC-999");
        Vehicle updatedVehicle = vehicleRepository.save(savedVehicle);

        Optional<Vehicle> retrievedVehicle = vehicleRepository.findById(updatedVehicle.getVehicleID());

        assertTrue(retrievedVehicle.isPresent());
        assertEquals("ABC-999", retrievedVehicle.get().getRegNumber());
        assertEquals("MAINTENANCE", retrievedVehicle.get().getStatus());
    }

    @Test
    void testDeleteVehicle_Success() {
        Vehicle savedVehicle = vehicleRepository.save(vehicle);
        Long vehicleId = savedVehicle.getVehicleID();

        vehicleRepository.deleteById(vehicleId);

        Optional<Vehicle> retrievedVehicle = vehicleRepository.findById(vehicleId);

        assertFalse(retrievedVehicle.isPresent());
    }

    @Test
    void testDeleteVehicle_NonExistent() {
        assertDoesNotThrow(() -> vehicleRepository.deleteById(9999L));
    }

    @Test
    void testSaveVehicle_WithNullFields() {
        Vehicle vehicleWithNulls = new Vehicle();
        vehicleWithNulls.setRegNumber(null);
        vehicleWithNulls.setType(null);

        Vehicle savedVehicle = vehicleRepository.save(vehicleWithNulls);

        assertNotNull(savedVehicle);
        assertNotNull(savedVehicle.getVehicleID());
        assertNull(savedVehicle.getRegNumber());
    }

    @Test
    void testFindByRegNumber_CaseSensitive() {
        vehicleRepository.save(vehicle);

        Vehicle retrievedVehicle = vehicleRepository.findByRegNumber("abc-123");

        assertNull(retrievedVehicle);
    }
}
