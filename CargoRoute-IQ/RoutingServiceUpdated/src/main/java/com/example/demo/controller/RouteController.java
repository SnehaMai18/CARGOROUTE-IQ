package com.example.demo.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.demo.dto.RouteDTO;
import com.example.demo.service.RouteService;

@RestController
@RequestMapping("/cargoRoute/routes")
@CrossOrigin(origins = "http://localhost:3000")
public class RouteController {

    @Autowired
    private RouteService routeService;

    @GetMapping("/getRoute/{id}")
    public ResponseEntity<RouteDTO> getRouteById(@PathVariable Long id) {
        return ResponseEntity.ok(routeService.getRouteById(id));
    }

    @GetMapping("/getAllRoutes")
    public ResponseEntity<List<RouteDTO>> getAllRoutes() {
        return ResponseEntity.ok(routeService.getAllRoutes());
    }

    @PostMapping("/createNewRoute")
    public ResponseEntity<Map<String, Object>> createRoute(@RequestBody RouteDTO routeDTO) {
        RouteDTO createdRoute = routeService.createRoute(routeDTO);
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Route created successfully");
        response.put("data", createdRoute);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/updateRoute/{id}")
    public ResponseEntity<Map<String, Object>> updateRoute(@PathVariable Long id, @RequestBody RouteDTO routeDTO) {
        RouteDTO updatedRoute = routeService.updateRoute(id, routeDTO);
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Route updated successfully with id: " + id);
        response.put("data", updatedRoute);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/deleteRoute/{id}")
    public ResponseEntity<Map<String, String>> deleteRoute(@PathVariable Long id) {
        routeService.deleteRoute(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Route deleted with id: " + id);
        return ResponseEntity.ok(response);
    }


    @GetMapping("/vehicle/{vehicleId}")
    public ResponseEntity<List<RouteDTO>> getRoutesByVehicleId(@PathVariable Long vehicleId) {
        return ResponseEntity.ok(routeService.getRoutesByVehicleId(vehicleId));
    }

    @GetMapping("/load/{loadId}")
    public ResponseEntity<List<RouteDTO>> getRoutesByLoadId(@PathVariable Long loadId) {
        return ResponseEntity.ok(routeService.getRoutesByLoadId(loadId));
    }
}