package com.example.demo.dto;

import java.time.LocalDateTime;

public class DriverAckDTO {

    private Long ackID; 	// Unique identifier for the acknowledgement record
    
    private Long dispatchID;

    private Long driverID; 
 
    private LocalDateTime ackAt; 
 
    private String notes; 
 
    //Getters and setters
	public Long getAckID() {
		return ackID;
	}

	public void setAckID(Long ackID) {
		this.ackID = ackID;
	}


	public Long getDispatchID() {
		return dispatchID;
	}

	public void setDispatchID(Long dispatchID) {
		this.dispatchID = dispatchID;
	}

	public Long getDriverID() {
		return driverID;
	}

	public void setDriverID(Long driverID) {
		this.driverID = driverID;
	}

	public LocalDateTime getAckAt() {
		return ackAt;
	}

	public void setAckAt(LocalDateTime ackAt) {
		this.ackAt = ackAt;
	}

	public String getNotes() {
		return notes;
	}

	public void setNotes(String notes) {
		this.notes = notes;
	}
    
} 