package com.example.demo.dto;
import java.time.LocalDateTime;
import com.example.demo.entities.enums.DispatchStatus;

public class DispatchDTO {
    
    private Long dispatchID;
    private Long loadID;
    private Long assignedDriverID;
    private String assignedBy;
    private LocalDateTime assignedAt;
    private DispatchStatus status;

    // Getters and Setters
    public Long getDispatchID() {
        return dispatchID;
    }

    public void setDispatchID(Long dispatchID) {
        this.dispatchID = dispatchID;
    }

    public Long getLoadID() {
        return loadID;
    }

    public void setLoadID(Long loadID) {
        this.loadID = loadID;
    }

    public Long getAssignedDriverID() {
        return assignedDriverID;
    }

    public void setAssignedDriverID(Long assignedDriverID) {
        this.assignedDriverID = assignedDriverID;
    }

    public String getAssignedBy() {
        return assignedBy;
    }

    public void setAssignedBy(String assignedBy) {
        this.assignedBy = assignedBy;
    }

    public LocalDateTime getAssignedAt() {
        return assignedAt;
    }

    public void setAssignedAt(LocalDateTime assignedAt) {
        this.assignedAt = assignedAt;
    }

    public DispatchStatus getStatus() {
        return status;
    }

    public void setStatus(DispatchStatus status) {
        this.status = status;
    }
}
