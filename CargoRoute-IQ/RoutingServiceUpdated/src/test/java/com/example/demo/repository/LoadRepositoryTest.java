package com.example.demo.repository;

import static org.junit.jupiter.api.Assertions.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import com.example.demo.entity.Load;

@DataJpaTest
class LoadRepositoryTest {

    @Autowired
    private LoadRepository loadRepository;

    private Load load;

    @BeforeEach
    void setUp() {
        load = new Load();
        load.setLoadCode("LOAD-001");
        load.setVehicleID(1L);
        load.setPlannedStart(LocalDateTime.of(2026, 4, 11, 8, 0));
        load.setPlannedEnd(LocalDateTime.of(2026, 4, 11, 18, 0));
        load.setTotalWeightKg(500.0);
        load.setTotalVolumeM3(10.0);
        load.setBookingsJSON("{\"bookings\": []}");
        load.setStatus("PLANNED");
    }

    @Test
    void testSaveLoad_Success() {
        Load savedLoad = loadRepository.save(load);

        assertNotNull(savedLoad);
        assertNotNull(savedLoad.getLoadID());
        assertEquals("LOAD-001", savedLoad.getLoadCode());
        assertEquals(1L, savedLoad.getVehicleID());
        assertEquals("PLANNED", savedLoad.getStatus());
        assertEquals(500.0, savedLoad.getTotalWeightKg());
    }

    @Test
    void testFindById_Success() {
        Load savedLoad = loadRepository.save(load);

        Optional<Load> retrievedLoad = loadRepository.findById(savedLoad.getLoadID());

        assertTrue(retrievedLoad.isPresent());
        assertEquals("LOAD-001", retrievedLoad.get().getLoadCode());
        assertEquals(1L, retrievedLoad.get().getVehicleID());
        assertEquals("PLANNED", retrievedLoad.get().getStatus());
    }

    @Test
    void testFindById_NotFound() {
        Optional<Load> retrievedLoad = loadRepository.findById(9999L);

        assertFalse(retrievedLoad.isPresent());
    }

    @Test
    void testFindAll_Success() {
        Load load2 = new Load();
        load2.setLoadCode("LOAD-002");
        load2.setVehicleID(2L);
        load2.setStatus("DISPATCHED");

        loadRepository.save(load);
        loadRepository.save(load2);

        List<Load> loads = loadRepository.findAll();

        assertEquals(2, loads.size());
    }

    @Test
    void testFindAll_EmptyDatabase() {
        List<Load> loads = loadRepository.findAll();

        assertTrue(loads.isEmpty());
    }

    @Test
    void testUpdateLoad_Success() {
        Load savedLoad = loadRepository.save(load);

        savedLoad.setStatus("DISPATCHED");
        savedLoad.setTotalWeightKg(600.0);
        Load updatedLoad = loadRepository.save(savedLoad);

        Optional<Load> retrievedLoad = loadRepository.findById(updatedLoad.getLoadID());

        assertTrue(retrievedLoad.isPresent());
        assertEquals("DISPATCHED", retrievedLoad.get().getStatus());
        assertEquals(600.0, retrievedLoad.get().getTotalWeightKg());
    }

    @Test
    void testDeleteLoad_Success() {
        Load savedLoad = loadRepository.save(load);
        Long loadId = savedLoad.getLoadID();

        loadRepository.deleteById(loadId);

        Optional<Load> retrievedLoad = loadRepository.findById(loadId);

        assertFalse(retrievedLoad.isPresent());
    }

    @Test
    void testDeleteLoad_NonExistent() {
        assertDoesNotThrow(() -> loadRepository.deleteById(9999L));
    }

    @Test
    void testSaveLoad_WithNullFields() {
        Load loadWithNulls = new Load();
        loadWithNulls.setLoadCode(null);
        loadWithNulls.setVehicleID(null);
        loadWithNulls.setStatus(null);

        Load savedLoad = loadRepository.save(loadWithNulls);

        assertNotNull(savedLoad);
        assertNotNull(savedLoad.getLoadID());
        assertNull(savedLoad.getLoadCode());
    }

    @Test
    void testFindAll_MultipleLoads() {
        Load load2 = new Load();
        load2.setLoadCode("LOAD-002");
        load2.setVehicleID(2L);
        load2.setStatus("IN_TRANSIT");

        Load load3 = new Load();
        load3.setLoadCode("LOAD-003");
        load3.setVehicleID(3L);
        load3.setStatus("COMPLETED");

        loadRepository.save(load);
        loadRepository.save(load2);
        loadRepository.save(load3);

        List<Load> loads = loadRepository.findAll();

        assertEquals(3, loads.size());
        assertTrue(loads.stream().anyMatch(l -> "PLANNED".equals(l.getStatus())));
        assertTrue(loads.stream().anyMatch(l -> "IN_TRANSIT".equals(l.getStatus())));
        assertTrue(loads.stream().anyMatch(l -> "COMPLETED".equals(l.getStatus())));
    }

    @Test
    void testUpdateLoad_MultipleFields() {
        Load savedLoad = loadRepository.save(load);

        savedLoad.setStatus("IN_TRANSIT");
        savedLoad.setTotalWeightKg(550.0);
        savedLoad.setTotalVolumeM3(12.0);
        Load updatedLoad = loadRepository.save(savedLoad);

        Optional<Load> retrieved = loadRepository.findById(updatedLoad.getLoadID());

        assertTrue(retrieved.isPresent());
        assertEquals("IN_TRANSIT", retrieved.get().getStatus());
        assertEquals(550.0, retrieved.get().getTotalWeightKg());
        assertEquals(12.0, retrieved.get().getTotalVolumeM3());
    }

    @Test
    void testSaveLoad_WithComplexBookingsJSON() {
        Load loadWithBookings = new Load();
        loadWithBookings.setLoadCode("LOAD-COMPLEX");
        loadWithBookings.setVehicleID(5L);
        loadWithBookings.setStatus("PLANNED");
        loadWithBookings.setBookingsJSON("{\"bookings\": [{\"id\": 1, \"destination\": \"NYC\", \"weight\": 100}, {\"id\": 2, \"destination\": \"LA\", \"weight\": 200}]}");

        Load savedLoad = loadRepository.save(loadWithBookings);

        Optional<Load> retrievedLoad = loadRepository.findById(savedLoad.getLoadID());

        assertTrue(retrievedLoad.isPresent());
        assertTrue(retrievedLoad.get().getBookingsJSON().contains("NYC"));
        assertTrue(retrievedLoad.get().getBookingsJSON().contains("LA"));
    }

    @Test
    void testFindAll_VariousVehicles() {
        Load load2 = new Load();
        load2.setLoadCode("LOAD-002");
        load2.setVehicleID(2L);
        load2.setStatus("DISPATCHED");

        Load load3 = new Load();
        load3.setLoadCode("LOAD-003");
        load3.setVehicleID(1L);  // Same vehicle as load
        load3.setStatus("PLANNED");

        loadRepository.save(load);
        loadRepository.save(load2);
        loadRepository.save(load3);

        List<Load> allLoads = loadRepository.findAll();

        assertEquals(3, allLoads.size());

        long vehicle1Loads = allLoads.stream().filter(l -> 1L == l.getVehicleID()).count();
        long vehicle2Loads = allLoads.stream().filter(l -> 2L == l.getVehicleID()).count();

        assertEquals(2, vehicle1Loads);
        assertEquals(1, vehicle2Loads);
    }

    @Test
    void testSaveLoad_WithTimes() {
        Load loadWithTimes = new Load();
        loadWithTimes.setLoadCode("LOAD-TIMES");
        loadWithTimes.setVehicleID(4L);
        loadWithTimes.setPlannedStart(LocalDateTime.of(2026, 4, 12, 6, 0));
        loadWithTimes.setPlannedEnd(LocalDateTime.of(2026, 4, 12, 20, 0));
        loadWithTimes.setStatus("PLANNED");

        Load savedLoad = loadRepository.save(loadWithTimes);

        Optional<Load> retrievedLoad = loadRepository.findById(savedLoad.getLoadID());

        assertTrue(retrievedLoad.isPresent());
        assertEquals(LocalDateTime.of(2026, 4, 12, 6, 0), retrievedLoad.get().getPlannedStart());
        assertEquals(LocalDateTime.of(2026, 4, 12, 20, 0), retrievedLoad.get().getPlannedEnd());
    }
}
