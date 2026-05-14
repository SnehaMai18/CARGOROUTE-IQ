package com.example.demo.controllers;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.demo.DTO.AuditLogDTO;
import com.example.demo.services.AuditLogService;

@RestController
@RequestMapping("/cargoRoute/internal/auditLogs")
public class InternalAuditLogController {

    private final AuditLogService auditLogService;

    public InternalAuditLogController(AuditLogService auditLogService) {
        this.auditLogService = auditLogService;
    }

    @PostMapping("/create")
    public ResponseEntity<AuditLogDTO> createFromInternal(@RequestBody AuditLogDTO dto) {
        return new ResponseEntity<>(auditLogService.saveAuditLog(dto), HttpStatus.CREATED);
    }
}
