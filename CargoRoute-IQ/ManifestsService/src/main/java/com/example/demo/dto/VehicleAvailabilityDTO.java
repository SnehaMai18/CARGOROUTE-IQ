package com.example.demo.dto;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonIgnore;


public class VehicleAvailabilityDTO {

    private Long availID;
    @JsonIgnore
    private VehicleDTO vehicle;
   
    private LocalDateTime date;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String reasonNote;
    private String status;

 // ... Getters and Setters ...
	public Long getAvailID() {
		return availID;
	}

	public void setAvailID(Long availID) {
		this.availID = availID;
	}

////	public Vehicle getVehicle() {
////		return vehicle;
////	}
////
////	public void setVehicle(Vehicle vehicle) {
////		this.vehicle = vehicle;
//	}

	public LocalDateTime getDate() {
		return date;
	}

	public void setDate(LocalDateTime date) {
		this.date = date;
	}

	public LocalDateTime getStartTime() {
		return startTime;
	}

	public void setStartTime(LocalDateTime startTime) {
		this.startTime = startTime;
	}

	public LocalDateTime getEndTime() {
		return endTime;
	}

	public void setEndTime(LocalDateTime endTime) {
		this.endTime = endTime;
	}

	public String getReasonNote() {
		return reasonNote;
	}

	public void setReasonNote(String reasonNote) {
		this.reasonNote = reasonNote;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}
    

    
}