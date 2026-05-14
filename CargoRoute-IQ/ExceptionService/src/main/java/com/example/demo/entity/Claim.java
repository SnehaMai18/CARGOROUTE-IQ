package com.example.demo.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

import com.example.demo.entity.enums.ClaimStatus;

@Entity // Marks this class as a JPA entity mapped to a database table 
public class Claim {

    @Id // Primary key
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    // Auto-incremented by the database (good fit for MySQL/PostgreSQL)
    private Long claimID;

    private Long filedBy;

    @CreationTimestamp
    // Automatically populated on INSERT by Hibernate (do not set manually)
    private LocalDateTime filedAt;

    // Total amount claimed
    private Double amountClaimed;

    // Notes added during resolution 
    private String resolutionNotes;

    @Enumerated(EnumType.STRING)
    // Persist enum value as String in DB (e.g., OPEN, UNDER_REVIEW, APPROVED, REJECTED)
    private ClaimStatus status;

    @OneToOne(fetch = FetchType.LAZY)
    // A claim is associated with exactly one exception record
    @JoinColumn(name = "exceptionID", nullable = false)
    // This entity owns the relationship; "exceptionID" is the FK column in the Claim table
    private ExceptionRecord exceptionRecord;

    // JPA requires a no-arg constructor
    public Claim(){}

    // ---- Getters & Setters ----

    public Long getClaimID() {
        return claimID;
    }

    public void setClaimID(Long claimID) {
        this.claimID = claimID;
    }

    public Long getFiledBy() {
        return filedBy;
    }

    public void setFiledBy(Long filedBy) {
        this.filedBy = filedBy;
    }

    public LocalDateTime getFiledAt() {
        return filedAt;
    }

    public void setFiledAt(LocalDateTime filedAt) {
        this.filedAt = filedAt;
    }

    public Double getAmountClaimed() {
        return amountClaimed;
    }

    public void setAmountClaimed(Double amountClaimed) {
        this.amountClaimed = amountClaimed;
    }

    public String getResolutionNotes() {
        return resolutionNotes;
    }

    public void setResolutionNotes(String resolutionNotes) {
        this.resolutionNotes = resolutionNotes;
    }

    public ClaimStatus getStatus() {
        return status;
    }

    public void setStatus(ClaimStatus status) {
        this.status = status;
    }

    public ExceptionRecord getExceptionRecord() {
        return exceptionRecord;
    }

    public void setExceptionRecord(ExceptionRecord exceptionRecord) {
        this.exceptionRecord = exceptionRecord;
    }
}
