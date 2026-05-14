package com.example.demo.controllers;


import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.example.demo.DTO.AuditLogDTO;
import com.example.demo.services.AuditLogService;

import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;

/**
 * AuditLogController
 * ------------------
 * Handles HTTP requests related to audit logs.
 * Typically restricted to ADMIN users.
 */
@RestController
@RequestMapping("/cargoRoute/auditLogs")
public class AuditLogController {

    private final AuditLogService service;

    public AuditLogController(AuditLogService service) {
        this.service = service;
    }

    /** Create audit log */
    @PostMapping("/create")
    public ResponseEntity<AuditLogDTO> createLog(@RequestBody AuditLogDTO dto) {
        return new ResponseEntity<>(service.saveAuditLog(dto), HttpStatus.CREATED);
    }

    /** Get all audit logs */
    @GetMapping("/getAllAuditLogs")
    public ResponseEntity<List<AuditLogDTO>> getAllLogs() {
        return ResponseEntity.ok(service.getAllAuditLogs());
    }

    /** Get audit log by ID */

    @GetMapping("/my")
    public ResponseEntity<List<AuditLogDTO>> getMyAuditLogs(HttpServletRequest request) {

        Long userId = (Long) request.getAttribute("userId");

        return ResponseEntity.ok(
           service.getAuditLogsByUserId(userId)
        );
        
        
    }
    
    @PreAuthorize("hasRole('Admin')")
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<AuditLogDTO>> getAuditLogsForUser(
            @PathVariable Long userId) {

        return ResponseEntity.ok(
            service.getAuditLogsByUserId(userId)
        );
    }

}