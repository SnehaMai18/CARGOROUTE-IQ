package com.example.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.stereotype.Repository;

import com.example.demo.entity.ExceptionRecord;
import com.example.demo.entity.enums.ExceptionStatus;
import java.util.List;

@Repository
public interface ExceptionRepository extends JpaRepository<ExceptionRecord, Long> {
    List<ExceptionRecord> findByBookingId(Long bookingId);
    List<ExceptionRecord> findByStatus(ExceptionStatus status);
    List<ExceptionRecord> findByType(com.example.demo.entity.enums.ExceptionType type);
    List<ExceptionRecord> findByReportedBy(Long userId);
}

