package com.example.demo.entities;

import jakarta.persistence.*;
import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

import com.example.demo.enums.NotificationCategory;

/**
 * Notification Entity
 * --------------------
 * Represents notifications sent to users.
 */
@Entity
public class Notification {

    /** Primary key */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long notificationID;


    // Reference to USER-SERVICE (NO JPA RELATIONSHIP)
    @Column(nullable = false)
    private Long userID;


    /** Related entity ID (order, invoice, etc.) */
    private Long entityID;

    /** Notification message */
    private String message;

    /** Notification category */
    @Enumerated(EnumType.STRING)
    private NotificationCategory category;

    /** Status (READ / UNREAD) */
    private String status;

    /** Auto-created timestamp */
    @CreationTimestamp
    private LocalDateTime createdAt;

    public Notification() {}

    public Notification(Long notificationID, Long userID, Long entityID,
                        String message, NotificationCategory category,
                        String status, LocalDateTime createdAt) {
        this.notificationID = notificationID;
        this.userID = userID;
        this.entityID = entityID;
        this.message = message;
        this.category = category;
        this.status = status;
        this.createdAt = createdAt;
    }

    // Getters and setters
    public Long getNotificationID() { return notificationID; }
    public void setNotificationID(Long notificationID) { this.notificationID = notificationID; }

    public Long getUserID() { return userID; }
    public void setUserID(Long userID) { this.userID = userID; } 
    public Long getEntityID() { return entityID; }
    public void setEntityID(Long entityID) { this.entityID = entityID; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public NotificationCategory getCategory() { return category; }
    public void setCategory(NotificationCategory category) { this.category = category; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
}