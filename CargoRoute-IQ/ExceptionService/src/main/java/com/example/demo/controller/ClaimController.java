package com.example.demo.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.ClaimDTO;
import com.example.demo.entity.enums.ClaimStatus;
import com.example.demo.exception.BadRequestException;
import com.example.demo.service.ClaimService;

@RestController
@RequestMapping("/cargoRoute/claim")
public class ClaimController {

    @Autowired
    private ClaimService service;

    @PostMapping("/addClaim")
    // Create a new Claim Admin if supported) may file claims
    @PreAuthorize("hasAnyRole('SHIPPER','ADMIN')")
    public ResponseEntity<Map<String, String>> addClaim(@RequestBody ClaimDTO c) {
        service.createClaim(c);
        return new ResponseEntity<>(Map.of("message", "Claim filed successfully."), HttpStatus.CREATED);
    }

    @GetMapping("/getClaims")
    // Retrieve all Claim records; SHIPPER sees only their own claims
    //@PreAuthorize("hasAnyRole('SHIPPER','DISPATCHER','ADMIN','FLEETMANAGER','WAREHOUSEMANAGER','BILLINGCLERK','ANALYST')")
    public ResponseEntity<List<ClaimDTO>> fetchAllClaims() {
        List<ClaimDTO> all = service.getAllClaims();
        return ResponseEntity.ok(all);
    }

    @GetMapping("/getClaimByID/{id}")
    // Retrieve a specific Claim by ID
    //@PreAuthorize("hasAnyRole('SHIPPER','DISPATCHER','ADMIN','FLEETMANAGER','WAREHOUSEMANAGER','BILLINGCLERK')")
    public ResponseEntity<ClaimDTO> fetchClaimById(@PathVariable Long id) {
        ClaimDTO dto = service.getClaimById(id);
        return ResponseEntity.ok(dto);
    }

    @PatchMapping("/updateClaimStatus/{id}")
    // Update only the status field of the Claim — only operational roles
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> modifyClaimStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String statusValue = body.get("status");
        if (statusValue == null || statusValue.isBlank()) {
            throw new BadRequestException("Status field is required in the request body.");
        }
        ClaimStatus status = ClaimStatus.fromValue(statusValue);
        service.updateClaimStatus(id, status);
        return ResponseEntity.ok(Map.of("message", "Claim status updated successfully."));
    }

    @GetMapping("/getClaimByExceptionID/{exceptionId}")
    // Retrieve all claims for a specific exception
    @PreAuthorize("hasAnyRole('SHIPPER','DISPATCHER','ADMIN','FLEETMANAGER','WAREHOUSEMANAGER','BILLINGCLERK')")
    public ResponseEntity<List<ClaimDTO>> fetchClaimByExceptionId(@PathVariable Long exceptionId) {
        return ResponseEntity.ok(service.getClaimByExceptionId(exceptionId));
    }

    @GetMapping("/getClaimByStatus/{status}")
    // Retrieve all claims by status
    @PreAuthorize("hasAnyRole('SHIPPER','DISPATCHER','ADMIN','FLEETMANAGER','WAREHOUSEMANAGER','BILLINGCLERK')")
    public ResponseEntity<List<ClaimDTO>> fetchByClaimStatus(@PathVariable ClaimStatus status) {
        return ResponseEntity.ok(service.getClaimByStatus(status));
    }
}