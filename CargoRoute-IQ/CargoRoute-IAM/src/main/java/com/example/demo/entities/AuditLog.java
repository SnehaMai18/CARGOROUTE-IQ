package com.example.demo.entities;

import jakarta.persistence.*;
import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

/**
 * AuditLog Entity
 * ----------------
 * Stores audit trail information for user actions.
 */
@Entity
public class AuditLog {

    //Primary key for audit log 
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long auditID;

    // ID of the user who performed the action
    @Column(name = "userid")
    private Long userID;

    // Action performed (CREATE, UPDATE, DELETE, LOGIN, etc.)
    private String action;

    // Resource type affected (USER, ORDER, INVOICE, etc.)
    @Column(name = "resource_type")
    private String resourceType;

    // Resource ID that was affected 
    @Column(name = "resourceid")
    private Long resourceID;

    // Additional information about the action 
    private String details;

    // Timestamp of when the action was performed

    @CreationTimestamp
    private LocalDateTime timestamp;

    // Default constructor (required by JPA) 
    public AuditLog() {}

    // Parameterized constructor 
    public AuditLog(Long auditID, Long userID, String action,
                    String resourceType, Long resourceID,
                    String details, LocalDateTime timestamp) {
        this.auditID = auditID;
        this.userID = userID;
        this.action = action;
        this.resourceType = resourceType;
        this.resourceID = resourceID;
        this.details = details;
        this.timestamp = timestamp;
    }

    // Getters and Setters

    public Long getAuditID() { return auditID; }
    public void setAuditID(Long auditID) { this.auditID = auditID; }

    public Long getUserID() { return userID; }
    public void setUserID(Long userID) { this.userID = userID; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public String getResourceType() { return resourceType; }
    public void setResourceType(String resourceType) { this.resourceType = resourceType; }

    public Long getResourceID() { return resourceID; }
    public void setResourceID(Long resourceID) { this.resourceID = resourceID; }

    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}