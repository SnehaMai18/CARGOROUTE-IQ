package com.example.demo.dto;

public class NotificationDTO {

    private Long userID;
    private Long entityID;
    private String message;
    private String category;

    public Long getUserID() {
        return userID;
    }

    public void setUserID(Long userID) {
        this.userID = userID;
    }

    public Long getEntityID() {
        return entityID;
    }

    public void setEntityID(Long entityID) {
        this.entityID = entityID;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }
}