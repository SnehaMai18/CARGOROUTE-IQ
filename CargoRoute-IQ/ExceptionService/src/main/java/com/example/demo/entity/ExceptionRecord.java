package com.example.demo.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.example.demo.entity.enums.ExceptionStatus;
import com.example.demo.entity.enums.ExceptionType;

@Entity // Marks this class as a JPA entity mapped to a database table
public class ExceptionRecord {

    @Id // Primary key
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Auto-increment DB-generated ID
    private Long exceptionID;

    @Enumerated(EnumType.STRING) // Stores enum names as strings (e.g., DELAY, DAMAGE, MISSING)
    private ExceptionType type;

    // Stores the numeric userId of the user who reported/created this exception
    private Long reportedBy;

    @CreationTimestamp   // Automatically populated on INSERT — exception report creation time
    private LocalDateTime reportedAt;

    @UpdateTimestamp // Automatically updated when modified
    private LocalDateTime updatedAt;

    // Description of the exception or issue
    private String description;

    @Enumerated(EnumType.STRING)
    // Current status of the exception
    private ExceptionStatus status;

    // Local ID of booking referenced by this exception (external microservice key)
    private Long bookingId;

    // Default constructor required by JPA
    public ExceptionRecord() {}

    // ---- Getters & Setters ----

    public Long getExceptionID() { return exceptionID; }
    public void setExceptionID(Long exceptionID) { this.exceptionID = exceptionID; }

    public ExceptionType getType() { return type; }
    public void setType(ExceptionType type) { this.type = type; }

    public Long getReportedBy() {
        return reportedBy;
    }

    public void setReportedBy(Long reportedBy) {
        this.reportedBy = reportedBy;
    }

    

    public LocalDateTime getReportedAt() { return reportedAt; }
    public void setReportedAt(LocalDateTime reportedAt) { this.reportedAt = reportedAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public ExceptionStatus getStatus() { return status; }
    public void setStatus(ExceptionStatus status) { this.status = status; }

    public Long getBookingId() { return bookingId; }
    public void setBookingId(Long bookingId) { this.bookingId = bookingId; }
}