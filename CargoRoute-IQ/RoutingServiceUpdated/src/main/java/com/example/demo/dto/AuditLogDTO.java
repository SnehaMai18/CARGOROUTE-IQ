package com.example.demo.dto;

public class AuditLogDTO {

    private Long auditID;
    private Long userID;
    private String action;
    private String resourceType;
    private Long resourceID;
    private String details;

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
}