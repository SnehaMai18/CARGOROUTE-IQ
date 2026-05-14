package com.example.demo.repositories;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.demo.entities.AuditLog;

/**
 * AuditLogRepository
 * ------------------
 * Handles database operations for AuditLog entity.
 */
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
	List<AuditLog> findByUserIDOrderByTimestampDesc(Long userID);
}