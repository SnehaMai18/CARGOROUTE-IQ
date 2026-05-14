package com.example.demo.dto;

import java.time.LocalDateTime;

import com.example.demo.entity.enums.ClaimStatus;

public class ClaimDTO {

    private Long claimID;
    private Long filedBy;
    private LocalDateTime filedAt;
    private Double amountClaimed;
    private String resolutionNotes;
    private ClaimStatus status;
    private Long exceptionID;
    private RequiredResponseDTO exception;

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

    public Long getExceptionID() {
        return exceptionID;
    }

    public void setExceptionID(Long exceptionID) {
        this.exceptionID = exceptionID;
    }

    public RequiredResponseDTO getException() {
        return exception;
    }

    
    public void setException(RequiredResponseDTO exception) {
        this.exception = exception;
    }
}