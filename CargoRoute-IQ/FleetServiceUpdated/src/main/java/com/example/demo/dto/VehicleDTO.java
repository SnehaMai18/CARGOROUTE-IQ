package com.example.demo.dto;
 
import java.time.LocalDateTime;

import java.util.ArrayList;

import java.util.List;
 
import jakarta.validation.constraints.NotBlank;

import jakarta.validation.constraints.NotNull;

import jakarta.validation.constraints.Min;
 
import com.example.demo.entity.enums.VehicleStatus;

import com.example.demo.entity.enums.VehicleType;
 
public class VehicleDTO {
 
    private Long vehicleID;
 
    @NotBlank(message = "Registration number cannot be blank")

    private String regNumber;
 
    @NotNull(message = "Vehicle type is required")

    private VehicleType type;
 
    @NotNull(message = "Max weight is required")

    @Min(value = 100, message = "Weight must be at least 100kg")

    private Double maxWeightKg;
 
    @NotNull(message = "Max volume is required")

    @Min(value = 1, message = "Volume must be greater than 0")

    private Double maxVolumeM3;
 
    @NotNull(message = "Status is required")

    private VehicleStatus status;
 
 
    private LocalDateTime lastMaintenanceAt;

// ✅ Accept driverID in requests

    private Long driverID;
 
    
 
	private DriverDTO driver;
 
    // ✅ Use DTO list instead of entity list

    private List<VehicleAvailabilityDTO> availabilities = new ArrayList<>();

    public Long getDriverID() {

		return driverID;

	}
 
	public void setDriverID(Long driverID) {

		this.driverID = driverID;

	}

	public Long getVehicleID() {

		return vehicleID;

	}
 
	public void setVehicleID(Long vehicleID) {

		this.vehicleID = vehicleID;

	}
 
	public String getRegNumber() {

		return regNumber;

	}
 
	public void setRegNumber(String regNumber) {

		this.regNumber = regNumber;

	}
 
	public VehicleType getType() {

		return type;

	}
 
	public void setType(VehicleType type) {

		this.type = type;

	}
 
	public Double getMaxWeightKg() {

		return maxWeightKg;

	}
 
	public void setMaxWeightKg(Double maxWeightKg) {

		this.maxWeightKg = maxWeightKg;

	}
 
	public Double getMaxVolumeM3() {

		return maxVolumeM3;

	}
 
	public void setMaxVolumeM3(Double maxVolumeM3) {

		this.maxVolumeM3 = maxVolumeM3;

	}
 
	public VehicleStatus getStatus() {

		return status;

	}
 
	public void setStatus(VehicleStatus status) {

		this.status = status;

	}
 
	public LocalDateTime getLastMaintenanceAt() {

		return lastMaintenanceAt;

	}
 
	public void setLastMaintenanceAt(LocalDateTime lastMaintenanceAt) {

		this.lastMaintenanceAt = lastMaintenanceAt;

	}
 
	public DriverDTO getDriver() {

		return driver;

	}
 
	public void setDriver(DriverDTO driver) {

		this.driver = driver;

	}
 
	public List<VehicleAvailabilityDTO> getAvailabilities() {

		return availabilities;

	}
 
	public void setAvailabilities(List<VehicleAvailabilityDTO> availabilities) {

		this.availabilities = availabilities;

	}
 
    

}
 