package com.example.demo.dto;

import java.util.List;

public class VehicleDTO {

    private Long vehicleID;
    private String regNumber;
    private String type;
    private Double maxWeightKg;
    private Double maxVolumeM3;
    private String status;

    private DriverDTO driver; // ✅ inside vehicle from billing
    private List<VehicleAvailabilityDTO> availabilities;
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
	public String getType() {
		return type;
	}
	public void setType(String type) {
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
	public String getStatus() {
		return status;
	}
	public void setStatus(String status) {
		this.status = status;
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