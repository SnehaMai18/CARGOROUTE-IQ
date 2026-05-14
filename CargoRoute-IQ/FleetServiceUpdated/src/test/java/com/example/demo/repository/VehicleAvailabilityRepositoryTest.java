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
import com.example.demo.entity.VehicleAvailability;
import com.example.demo.entity.enums.VehicleType;

@DataJpaTest
class VehicleAvailabilityRepositoryTest {

    @Autowired
    private VehicleAvailabilityRepository availabilityRepository;

    @Autowired
    private VehicleRepository vehicleRepository;

    private VehicleAvailability availability;
    private Vehicle vehicle;

    @BeforeEach
    void setUp() {
        vehicle = new Vehicle();
        vehicle.setRegNumber("ABC-123");
        vehicle.setType(VehicleType.TRUCK);
        vehicle.setMaxWeightKg(12000.0);
        vehicle.setMaxVolumeM3(40.0);
        vehicle.setStatus("AVAILABLE");
        vehicle = vehicleRepository.save(vehicle);

        availability = new VehicleAvailability();
        availability.setVehicle(vehicle);
        availability.setDate(LocalDateTime.of(2026, 4, 11, 0, 0));
        availability.setStartTime(LocalDateTime.of(2026, 4, 11, 8, 0));
        availability.setEndTime(LocalDateTime.of(2026, 4, 11, 18, 0));
        availability.setReasonNote("Maintenance window");
        availability.setStatus("OPEN");
    }

    @Test
    void testSaveAvailability_Success() {
        VehicleAvailability saved = availabilityRepository.save(availability);

        assertNotNull(saved);
        assertNotNull(saved.getAvailID());
        assertEquals("OPEN", saved.getStatus());
        assertEquals("Maintenance window", saved.getReasonNote());
        assertEquals(vehicle.getVehicleID(), saved.getVehicle().getVehicleID());
    }

    @Test
    void testFindById_Success() {
        VehicleAvailability saved = availabilityRepository.save(availability);

        Optional<VehicleAvailability> retrieved = availabilityRepository.findById(saved.getAvailID());

        assertTrue(retrieved.isPresent());
        assertEquals("OPEN", retrieved.get().getStatus());
        assertEquals(vehicle.getVehicleID(), retrieved.get().getVehicle().getVehicleID());
    }

    @Test
    void testFindById_NotFound() {
        Optional<VehicleAvailability> retrieved = availabilityRepository.findById(9999L);

        assertFalse(retrieved.isPresent());
    }

    @Test
    void testFindByVehicleId_Success() {
        VehicleAvailability availability2 = new VehicleAvailability();
        availability2.setVehicle(vehicle);
        availability2.setDate(LocalDateTime.of(2026, 4, 12, 0, 0));
        availability2.setStartTime(LocalDateTime.of(2026, 4, 12, 8, 0));
        availability2.setEndTime(LocalDateTime.of(2026, 4, 12, 18, 0));
        availability2.setStatus("CLOSED");

        availabilityRepository.save(availability);
        availabilityRepository.save(availability2);

        List<VehicleAvailability> availabilities = availabilityRepository.findByVehicle_VehicleID(vehicle.getVehicleID());

        assertEquals(2, availabilities.size());
        assertTrue(availabilities.stream().allMatch(a -> a.getVehicle().getVehicleID().equals(vehicle.getVehicleID())));
    }

    @Test
    void testFindByVehicleId_NoResults() {
        List<VehicleAvailability> availabilities = availabilityRepository.findByVehicle_VehicleID(9999L);

        assertTrue(availabilities.isEmpty());
    }

    @Test
    void testFindAll_Success() {
        VehicleAvailability availability2 = new VehicleAvailability();
        availability2.setVehicle(vehicle);
        availability2.setDate(LocalDateTime.of(2026, 4, 12, 0, 0));
        availability2.setStatus("CLOSED");

        availabilityRepository.save(availability);
        availabilityRepository.save(availability2);

        List<VehicleAvailability> availabilities = availabilityRepository.findAll();

        assertEquals(2, availabilities.size());
    }

    @Test
    void testFindAll_EmptyDatabase() {
        List<VehicleAvailability> availabilities = availabilityRepository.findAll();

        assertTrue(availabilities.isEmpty());
    }

    @Test
    void testUpdateAvailability_Success() {
        VehicleAvailability saved = availabilityRepository.save(availability);

        saved.setStatus("CLOSED");
        saved.setReasonNote("Updated reason");
        VehicleAvailability updated = availabilityRepository.save(saved);

        Optional<VehicleAvailability> retrieved = availabilityRepository.findById(updated.getAvailID());

        assertTrue(retrieved.isPresent());
        assertEquals("CLOSED", retrieved.get().getStatus());
        assertEquals("Updated reason", retrieved.get().getReasonNote());
    }

    @Test
    void testDeleteAvailability_Success() {
        VehicleAvailability saved = availabilityRepository.save(availability);
        Long availabilityId = saved.getAvailID();

        availabilityRepository.deleteById(availabilityId);

        Optional<VehicleAvailability> retrieved = availabilityRepository.findById(availabilityId);

        assertFalse(retrieved.isPresent());
    }

    @Test
    void testDeleteAvailability_NonExistent() {
        assertDoesNotThrow(() -> availabilityRepository.deleteById(9999L));
    }

    @Test
    void testSaveAvailability_WithNullFields() {
        VehicleAvailability availabilityWithNulls = new VehicleAvailability();
        availabilityWithNulls.setVehicle(vehicle);
        availabilityWithNulls.setReasonNote(null);
        availabilityWithNulls.setStatus(null);

        VehicleAvailability saved = availabilityRepository.save(availabilityWithNulls);

        assertNotNull(saved);
        assertNotNull(saved.getAvailID());
        assertNull(saved.getReasonNote());
    }

    @Test
    void testFindByVehicleId_MultipleVehicles() {
        Vehicle vehicle2 = new Vehicle();
        vehicle2.setRegNumber("XYZ-789");
        vehicle2.setType(VehicleType.VAN);
        vehicle2.setMaxWeightKg(5000.0);
        vehicle2.setMaxVolumeM3(20.0);
        vehicle2 = vehicleRepository.save(vehicle2);

        VehicleAvailability availability2 = new VehicleAvailability();
        availability2.setVehicle(vehicle2);
        availability2.setDate(LocalDateTime.of(2026, 4, 12, 0, 0));

        availabilityRepository.save(availability);
        availabilityRepository.save(availability2);

        List<VehicleAvailability> availabilitiesForVehicle1 = availabilityRepository.findByVehicle_VehicleID(vehicle.getVehicleID());
        List<VehicleAvailability> availabilitiesForVehicle2 = availabilityRepository.findByVehicle_VehicleID(vehicle2.getVehicleID());

        assertEquals(1, availabilitiesForVehicle1.size());
        assertEquals(1, availabilitiesForVehicle2.size());
        assertEquals(vehicle.getVehicleID(), availabilitiesForVehicle1.get(0).getVehicle().getVehicleID());
        assertEquals(vehicle2.getVehicleID(), availabilitiesForVehicle2.get(0).getVehicle().getVehicleID());
    }
}
