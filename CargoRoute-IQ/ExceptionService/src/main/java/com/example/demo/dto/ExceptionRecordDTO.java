package com.example.demo.dto;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonProperty.Access;
import com.example.demo.entity.enums.ExceptionStatus;
import com.example.demo.entity.enums.ExceptionType;

public class ExceptionRecordDTO {

    private Long exceptionID;
    private ExceptionType type;
    // Numeric userId — always set from auth context; READ_ONLY so it's serialized but frontend value is ignored
    @JsonProperty(access = Access.READ_ONLY)
    private Long reportedBy;
    private LocalDateTime reportedAt;
    private LocalDateTime updatedAt;
    private String description;
    private ExceptionStatus status;
    private Long bookingId;
    
    
    public Long getExceptionID() {
        return exceptionID;
    }

    public void setExceptionID(Long exceptionID) {
        this.exceptionID = exceptionID;
    }

    public ExceptionType getType() {
        return type;
    }

    public void setType(ExceptionType type) {
        this.type = type;
    }

    public Long getReportedBy() {
        return reportedBy;
    }

    public void setReportedBy(Long reportedBy) {
        this.reportedBy = reportedBy;
    }

    

    public LocalDateTime getReportedAt() {
        return reportedAt;
    }

    public void setReportedAt(LocalDateTime reportedAt) {
        this.reportedAt = reportedAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public ExceptionStatus getStatus() {
        return status;
    }

    public void setStatus(ExceptionStatus status) {
        this.status = status;
    }

    public Long getBookingId() {
        return bookingId;
    }

    public void setBookingId(Long bookingId) {
        this.bookingId = bookingId;
    }

  
}
