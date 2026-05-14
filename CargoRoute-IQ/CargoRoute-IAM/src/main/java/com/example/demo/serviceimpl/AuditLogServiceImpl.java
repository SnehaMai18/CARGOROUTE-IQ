package com.example.demo.serviceimpl;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.example.demo.DTO.AuditLogDTO;
import com.example.demo.entities.AuditLog;
import com.example.demo.repositories.AuditLogRepository;
import com.example.demo.services.AuditLogService;
import com.example.demo.exceptions.ResourceNotFoundException;

/**
 * AuditLogServiceImpl
 * -------------------
 * Implements audit log business logic.
 */
@Service
public class AuditLogServiceImpl implements AuditLogService {

    private final AuditLogRepository repository;

    public AuditLogServiceImpl(AuditLogRepository repository) {
        this.repository = repository;
    }

    @Override
    public AuditLogDTO saveAuditLog(AuditLogDTO dto) {

        AuditLog log = new AuditLog();
        log.setUserID(dto.getUserID());
        log.setAction(dto.getAction());
        log.setResourceType(dto.getResourceType());
        log.setResourceID(dto.getResourceID());
        log.setDetails(dto.getDetails());

        // ✅ authoritative timestamp
        log.setTimestamp(LocalDateTime.now());

        return mapToDTO(repository.save(log));
    }
    

    @Override
    public List<AuditLogDTO> getAllAuditLogs() {

        List<AuditLogDTO> dtoList = new ArrayList<>();
        for (AuditLog log : repository.findAll()) {
            dtoList.add(mapToDTO(log));
        }
        return dtoList;
    }

    @Override
    public List<AuditLogDTO> getAuditLogsByUserId(Long userId) {

        List<AuditLog> logs =
            repository.findByUserIDOrderByTimestampDesc(userId);

        List<AuditLogDTO> dtoList = new ArrayList<>();
        for (AuditLog log : logs) {
            dtoList.add(mapToDTO(log));
        }
        return dtoList;
    }


    /** Entity → DTO mapper */
    private AuditLogDTO mapToDTO(AuditLog log) {

        AuditLogDTO dto = new AuditLogDTO();
        dto.setAuditID(log.getAuditID());
        dto.setUserID(log.getUserID());
        dto.setAction(log.getAction());
        dto.setResourceType(log.getResourceType());
        dto.setResourceID(log.getResourceID());
        dto.setDetails(log.getDetails());
        dto.setTimestamp(log.getTimestamp());

        return dto;
    }
}