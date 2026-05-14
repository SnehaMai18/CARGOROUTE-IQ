package com.example.demo.repository;

import static org.junit.jupiter.api.Assertions.*;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import com.example.demo.entity.Route;
import com.example.demo.entity.Load;

@DataJpaTest
class RouteRepositoryTest {

    @Autowired
    private RouteRepository routeRepository;

    @Autowired
    private LoadRepository loadRepository;

    private Route route;
    private Load load;

    @BeforeEach
    void setUp() {
        load = new Load();
        load.setLoadCode("LOAD-001");
        load.setVehicleID(1L);
        load.setTotalWeightKg(500.0);
        load.setTotalVolumeM3(10.0);
        load.setStatus("PLANNED");
        load = loadRepository.save(load);

        route = new Route();
        route.setLoad(load);
        route.setSequenceJSON("{\"stops\": []}");
        route.setDistanceKm(100.5);
        route.setEstimatedDurationMin(120);
        route.setCostEstimate(250.0);
        route.setStatus("PLANNED");
    }

    @Test
    void testSaveRoute_Success() {
        Route savedRoute = routeRepository.save(route);

        assertNotNull(savedRoute);
        assertNotNull(savedRoute.getRouteID());
        assertEquals("PLANNED", savedRoute.getStatus());
        assertEquals(100.5, savedRoute.getDistanceKm());
        assertEquals(load.getLoadID(), savedRoute.getLoad().getLoadID());
    }

    @Test
    void testFindById_Success() {
        Route savedRoute = routeRepository.save(route);

        Optional<Route> retrievedRoute = routeRepository.findById(savedRoute.getRouteID());

        assertTrue(retrievedRoute.isPresent());
        assertEquals("PLANNED", retrievedRoute.get().getStatus());
        assertEquals(100.5, retrievedRoute.get().getDistanceKm());
    }

    @Test
    void testFindById_NotFound() {
        Optional<Route> retrievedRoute = routeRepository.findById(9999L);

        assertFalse(retrievedRoute.isPresent());
    }

    @Test
    void testFindAll_Success() {
        Route route2 = new Route();
        route2.setLoad(load);
        route2.setSequenceJSON("{\"stops\": []}");
        route2.setDistanceKm(150.0);
        route2.setStatus("IN_PROGRESS");

        routeRepository.save(route);
        routeRepository.save(route2);

        List<Route> routes = routeRepository.findAll();

        assertEquals(2, routes.size());
    }

    @Test
    void testFindAll_EmptyDatabase() {
        List<Route> routes = routeRepository.findAll();

        assertTrue(routes.isEmpty());
    }

    @Test
    void testUpdateRoute_Success() {
        Route savedRoute = routeRepository.save(route);

        savedRoute.setStatus("COMPLETED");
        savedRoute.setDistanceKm(105.0);
        Route updatedRoute = routeRepository.save(savedRoute);

        Optional<Route> retrievedRoute = routeRepository.findById(updatedRoute.getRouteID());

        assertTrue(retrievedRoute.isPresent());
        assertEquals("COMPLETED", retrievedRoute.get().getStatus());
        assertEquals(105.0, retrievedRoute.get().getDistanceKm());
    }

    @Test
    void testDeleteRoute_Success() {
        Route savedRoute = routeRepository.save(route);
        Long routeId = savedRoute.getRouteID();

        routeRepository.deleteById(routeId);

        Optional<Route> retrievedRoute = routeRepository.findById(routeId);

        assertFalse(retrievedRoute.isPresent());
    }

    @Test
    void testDeleteRoute_NonExistent() {
        assertDoesNotThrow(() -> routeRepository.deleteById(9999L));
    }

    @Test
    void testSaveRoute_WithNullFields() {
        Route routeWithNulls = new Route();
        routeWithNulls.setLoad(load);
        routeWithNulls.setSequenceJSON(null);
        routeWithNulls.setStatus(null);

        Route savedRoute = routeRepository.save(routeWithNulls);

        assertNotNull(savedRoute);
        assertNotNull(savedRoute.getRouteID());
        assertNull(savedRoute.getSequenceJSON());
    }

    @Test
    void testFindAll_MultipleRoutes() {
        Route route2 = new Route();
        route2.setLoad(load);
        route2.setDistanceKm(200.0);
        route2.setStatus("IN_PROGRESS");

        Route route3 = new Route();
        route3.setLoad(load);
        route3.setDistanceKm(300.0);
        route3.setStatus("COMPLETED");

        routeRepository.save(route);
        routeRepository.save(route2);
        routeRepository.save(route3);

        List<Route> routes = routeRepository.findAll();

        assertEquals(3, routes.size());
        assertTrue(routes.stream().anyMatch(r -> "PLANNED".equals(r.getStatus())));
        assertTrue(routes.stream().anyMatch(r -> "IN_PROGRESS".equals(r.getStatus())));
        assertTrue(routes.stream().anyMatch(r -> "COMPLETED".equals(r.getStatus())));
    }

    @Test
    void testUpdateRoute_MultipleFields() {
        Route savedRoute = routeRepository.save(route);

        savedRoute.setStatus("IN_PROGRESS");
        savedRoute.setDistanceKm(110.0);
        savedRoute.setEstimatedDurationMin(130);
        savedRoute.setCostEstimate(300.0);

        Route updatedRoute = routeRepository.save(savedRoute);

        Optional<Route> retrieved = routeRepository.findById(updatedRoute.getRouteID());

        assertTrue(retrieved.isPresent());
        assertEquals("IN_PROGRESS", retrieved.get().getStatus());
        assertEquals(110.0, retrieved.get().getDistanceKm());
        assertEquals(130, retrieved.get().getEstimatedDurationMin());
        assertEquals(300.0, retrieved.get().getCostEstimate());
    }
}
