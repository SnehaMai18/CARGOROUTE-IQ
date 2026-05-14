package com.example.demo.controller;

import java.util.List;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import com.example.demo.dto.LoadDTO;
import com.example.demo.dto.RequiredResponseDTO;
import com.example.demo.service.LoadService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/cargoRoute/loads")
@CrossOrigin(origins = "http://localhost:3000")
public class LoadController {

    @Autowired
    private LoadService loadService;
 
    
 // CREATE
    @PostMapping("/createNewLoad")
    public ResponseEntity<String> createLoad(@Valid @RequestBody LoadDTO loadDTO) {
        loadService.createLoad(loadDTO);
        return new ResponseEntity<>("Load has been created successfully", HttpStatus.CREATED);
    }

 // UPDATE
    @PutMapping("/updateLoad/{id}")
    public ResponseEntity<Map<String, Object>> updateLoad(@Valid @PathVariable Long id, @RequestBody LoadDTO loadDTO) {
        LoadDTO updated = loadService.updateLoad(id, loadDTO);
        Map<String, Object> response = new LinkedHashMap<>(); // ✅ preserves order
        response.put("message", "Load updated successfully for ID " + id + ".");
        response.put("load", updated);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/getLoad/{id}")
    public ResponseEntity<RequiredResponseDTO> getLoadById(@PathVariable Long id) {
        return ResponseEntity.ok(loadService.getLoadById(id));
    }
    @GetMapping("/getAllLoads")
    public ResponseEntity<List<RequiredResponseDTO>> getAllLoads() {
        return ResponseEntity.ok(loadService.getAllLoads());
    }

    // DELETE
    @DeleteMapping("/deleteLoad/{id}")
    public ResponseEntity<Map<String, Object>> deleteLoad(@PathVariable Long id) {
        loadService.deleteLoad(id);
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Load deleted successfully for ID " + id + ".");
        return ResponseEntity.ok(response);
    }
}