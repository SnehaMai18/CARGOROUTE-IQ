package com.example.demo.DTO;

import java.time.LocalDateTime;

import com.example.demo.enums.NotificationCategory;

/**
 * NotificationDTO
 * ----------------
 * Used for API request/response.
 */
public class NotificationDTO {

    private Long notificationID;
    private Long userID;
    private Long entityID;
    private String message;
    private NotificationCategory category;
    private String status;
    private LocalDateTime createdAt;

    public NotificationDTO() {}

    // Getters & setters
    public Long getNotificationID() { return notificationID; }
    public void setNotificationID(Long notificationID) { this.notificationID = notificationID; }

    public Long getUserID() { return userID; }
    public void setUserID(Long userId) { this.userID = userId; }

    public Long getEntityID() { return entityID; }
    public void setEntityID(Long entityID) { this.entityID = entityID; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public NotificationCategory getCategory() { return category; }
    public void setCategory(NotificationCategory category) { this.category = category; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}