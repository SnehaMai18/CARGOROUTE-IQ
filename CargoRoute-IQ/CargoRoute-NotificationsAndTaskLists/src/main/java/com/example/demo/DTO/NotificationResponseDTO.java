package com.example.demo.DTO;

public class NotificationResponseDTO {

    private NotificationDTO notification;
    private InternalUserDTO user;
    
    public NotificationResponseDTO() {
    	
    }
    
    // getters & setters
	public NotificationDTO getNotification() {
		return notification;
	}
	public void setNotification(NotificationDTO notification) {
		this.notification = notification;
	}
	public InternalUserDTO getUser() {
		return user;
	}
	public void setUser(InternalUserDTO user) {
		this.user = user;
	}

    
}