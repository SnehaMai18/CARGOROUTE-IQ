package com.example.demo.dto;

import java.time.LocalDateTime;
import com.example.demo.entity.Vehicle;
import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;


public class VehicleAvailabilityDTO {

    private Long availID;
    @JsonIgnore
    private VehicleDTO vehicle;

    @NotNull(message = "Date is required")
    @FutureOrPresent(message = "Date must be today or in the future")
    private LocalDateTime date;

    @NotNull(message = "Start time is required")
    private LocalDateTime startTime;

    @NotNull(message = "End time is required")
    private LocalDateTime endTime;

    @Size(max = 255, message = "Reason note cannot exceed 255 characters")
    private String reasonNote;

    @NotNull(message = "Status is required")
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