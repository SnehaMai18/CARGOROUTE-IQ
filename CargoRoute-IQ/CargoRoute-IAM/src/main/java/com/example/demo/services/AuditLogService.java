package com.example.demo.services;

import java.util.List;
import com.example.demo.DTO.AuditLogDTO;

/**
 * AuditLogService
 * ----------------
 * Defines business operations for audit logs.
 */
public interface AuditLogService {

    /** Creates a new audit log entry */
    AuditLogDTO saveAuditLog(AuditLogDTO dto);

    /** Retrieves all audit logs */
    List<AuditLogDTO> getAllAuditLogs();

    /** Retrieves audit log by ID */
    List<AuditLogDTO> getAuditLogsByUserId(Long userId);
}