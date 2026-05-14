package com.example.demo.controller;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
 
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
 
import com.example.demo.dto.HandoverDTO;
import com.example.demo.dto.HandoverResponseDTO;
import com.example.demo.service.HandoverService;
 
 
@RestController
@RequestMapping("/cargoRoute/handovers")
public class HandoverController {
 
    @Autowired
    private HandoverService handoverService;
 
    // CREATE
    @PostMapping("/createHandover")
    @PreAuthorize("hasAnyRole('WareHouseManager','Admin')")
    public ResponseEntity<Map<String, String>> create(@RequestBody HandoverDTO dto) {
        handoverService.create(dto);
        return new ResponseEntity<>(Map.of("message", "Handover created successfully."),
                HttpStatus.CREATED);
 
    }
 
    // FETCH BY ID
    @GetMapping("/getByHandoverId/{id}")
    @PreAuthorize("hasAnyRole('Dispatcher', 'Driver', 'Admin','FleetManager','BillingClerk','WareHouseManager','Analyst')")
    public ResponseEntity<HandoverResponseDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(handoverService.getById(id));
    }
 
    // FETCH ALL
    @GetMapping("/getAllHandovers")
    @PreAuthorize("hasAnyRole('Dispatcher', 'Driver', 'Admin','FleetManager','BillingClerk','WareHouseManager','Analyst')")
    public ResponseEntity<List<HandoverResponseDTO>> getAll() {
        return ResponseEntity.ok(handoverService.getAll());
    }
 
    // FETCH BY MANIFEST ID
    @GetMapping("/getByManifestId/{manifestID}")
    @PreAuthorize("hasAnyRole('Dispatcher', 'Driver', 'Admin','FleetManager','BillingClerk','WareHouseManager','Analyst')")
    public ResponseEntity<List<HandoverResponseDTO>> getByManifestID(
            @PathVariable Long manifestID) {
        return ResponseEntity.ok(handoverService.getByManifestID(manifestID));
    }
 
    // FETCH BY HANDED BY
    @GetMapping("/getHanded-by/{handedBy}")
    @PreAuthorize("hasAnyRole('Dispatcher', 'Driver', 'Admin','FleetManager','BillingClerk','WareHouseManager','Analyst')")
    public ResponseEntity<List<HandoverResponseDTO>> getByHandedBy(@PathVariable String handedBy) {
        return ResponseEntity.ok(handoverService.getByHandedBy(handedBy));
    }
 
    // UPDATE
    @PutMapping("/updateHandover/{handoverId}")
    @PreAuthorize("hasAnyRole('WareHouseManager','Admin')")
    public ResponseEntity<Map<String, String>> update(
            @PathVariable Long handoverId, @RequestBody HandoverDTO dto) {
        handoverService.update(handoverId, dto);
        return ResponseEntity.ok(Map.of("message", "Handover updated successfully."));
    }
 
    // DELETE
    @DeleteMapping("/deleteByHandoverId/{id}")
    @PreAuthorize("hasAnyRole('WareHouseManager','Admin')")
    public ResponseEntity<Map<String, String>> delete(@PathVariable Long id) {
        handoverService.delete(id);
        return ResponseEntity.ok(
                Map.of("message", "Handover deleted successfully."));
    }
 
}
 
 