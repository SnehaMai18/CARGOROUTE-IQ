package com.example.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.HashMap;
import java.util.Map;
import com.example.demo.entity.VehicleAvailability;
import com.example.demo.service.VehicleAvailabilityService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/cargoRoute/vehicleAvailability")
public class VehicleAvailabilityController {

    @Autowired
    private VehicleAvailabilityService service;

    // CREATE
    @PostMapping("/createNewVehicleAvailability")
    public ResponseEntity<Map<String, Object>> create(@Valid @RequestBody VehicleAvailability v) {
        VehicleAvailability saved = service.save(v);
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Vehicle availability created successfully.");
        response.put("vehicleAvailability", saved);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

 // READ ALL
    @GetMapping("/getAllVehicleAvailabilities")
    public List<VehicleAvailability> getAll() {
        return service.getAll();
    }

    // READ BY ID
    @GetMapping("/getVehicleAvailability/{id}")
    public VehicleAvailability get(@PathVariable Long id) {
        return service.getById(id);
    }

    // READ BY VEHICLE ID
    @GetMapping("/vehicle/{vehicleId}")
    public List<VehicleAvailability> getByVehicle(@PathVariable Long vehicleId) {
        return service.getByVehicleId(vehicleId);
    }


    // UPDATE
    @PutMapping("/updateVehicleAvailability/{id}")
    public VehicleAvailability update(@Valid @PathVariable Long id, @RequestBody VehicleAvailability v) {
        return service.update(id, v);
    }

    // DELETE
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> delete(@PathVariable Long id) {
        service.delete(id);
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Vehicle availability deleted successfully for ID " + id + ".");
        return ResponseEntity.ok(response);
    }
}