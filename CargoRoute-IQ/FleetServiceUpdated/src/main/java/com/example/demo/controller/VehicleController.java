package com.example.demo.controller;


import com.example.demo.dto.VehicleDTO;
import com.example.demo.service.VehicleService;

import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;


import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/cargoRoute/vehicles")
public class VehicleController {

    @Autowired
    private VehicleService vehicleService;

    @PostMapping("/createNewVehicle")
    @PreAuthorize("hasAnyRole('ADMIN','FLEETMANAGER')")
    public ResponseEntity<String> create(@Valid @RequestBody VehicleDTO vehicleDTO) {
        VehicleDTO created = vehicleService.createVehicle(vehicleDTO);
        String message="Vehicle is succesfully created";
        return new ResponseEntity<>(message, HttpStatus.CREATED);
    }

    @GetMapping("/getAllVehicles")
    public List<VehicleDTO> getAllVehicles() {
        return vehicleService.getAllVehicles();
    }

    // READ BY ID (with driver + availabilities)
    @GetMapping("/getVehicle/{id}")
    public VehicleDTO getVehicle(@PathVariable Long id) {
        return vehicleService.getVehicleById(id);
    }

   
    @PutMapping("/updateVehicle/{id}")
    public ResponseEntity<Map<String, Object>> update(
            @PathVariable Long id,
            @Valid @RequestBody VehicleDTO vehicleDTO) {

        VehicleDTO updatedVehicle = vehicleService.updateVehicle(id, vehicleDTO);

        Map<String, Object> response = new LinkedHashMap<>(); // preserves insertion order
        response.put("message", "Vehicle with ID: " + id + " is successfully updated.");
        response.put("updatedVehicle", updatedVehicle);

        return new ResponseEntity<>(response, HttpStatus.OK);
    }
    
    // DELETE
    @DeleteMapping("/deleteVehicle/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        vehicleService.deleteVehicle(id);
        String message = "Vehicle with ID: " + id + " is successfully deleted.";
        return new ResponseEntity<>(message, HttpStatus.OK);
    }
}