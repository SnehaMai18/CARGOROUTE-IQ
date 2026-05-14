package com.example.demo.controller;

import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.example.demo.dto.ShipperDTO;
import com.example.demo.entity.enums.ShipperStatus;
import com.example.demo.service.ShipperService;

@RestController
@RequestMapping("/cargoRoute/shipper")
public class ShipperController {

    @Autowired
    private ShipperService service;

    @PostMapping("/addShipper")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> addShipper(@RequestBody ShipperDTO s) {
        service.createShipper(s);
        return new ResponseEntity<>(Map.of("message", "Shipper created successfully."), HttpStatus.CREATED);
    }

    @GetMapping("/getShippers")
//    @PreAuthorize("hasAnyRole('ADMIN','DISPATCHER','SHIPPER','ANALYST','FLEETMANAGER','WAREHOUSEMANAGER','BILLINGCLERK')")
    public ResponseEntity<List<ShipperDTO>> fetchAllShippers() {
        List<ShipperDTO> shippers = service.getAllShippers();
        return ResponseEntity.ok(shippers);
    }

    @GetMapping("/getShipper/{id}")
//    @PreAuthorize("hasAnyRole('ADMIN','DISPATCHER','SHIPPER','FLEETMANAGER','WAREHOUSEMANAGER','BILLINGCLERK','ANALYST')")
    public ResponseEntity<ShipperDTO> fetchShipperById(@PathVariable Long id) {
        ShipperDTO shipper = service.getShipperById(id);
        return ResponseEntity.ok(shipper);
    }

    @PutMapping("/updateShipper/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> modifyShipper(@PathVariable Long id, @RequestBody ShipperDTO updated) {
        updated.setShipperID(id);
        service.createShipper(updated);
        return ResponseEntity.ok(Map.of("message", "Shipper updated successfully."));
    }

    @GetMapping("/getShippersByStatus/{status}")
//    @PreAuthorize("hasAnyRole('ADMIN','DISPATCHER','ANALYST','WAREHOUSEMANAGER','BILLINGCLERK')")
    public ResponseEntity<List<ShipperDTO>> fetchByShipperStatus(@PathVariable ShipperStatus status) {
        List<ShipperDTO> shippers = service.getByShipperStatus(status);
        return ResponseEntity.ok(shippers);
    }
}