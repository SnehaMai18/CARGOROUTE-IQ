package com.example.demo.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.example.demo.entity.enums.VehicleStatus;
import com.example.demo.entity.enums.VehicleType;
import com.fasterxml.jackson.annotation.JsonManagedReference;


@Entity
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long vehicleID;

    private String regNumber;

    @Enumerated(EnumType.STRING)
    private VehicleType type;

    private Double maxWeightKg;
    
    @Column(name = "max_volume_m3")
    private Double maxVolumeM3;
    
    @Enumerated(EnumType.STRING)
    private VehicleStatus status;
    private LocalDateTime lastMaintenanceAt;

    
    private Long driverID; 

    
    @JsonManagedReference
    @OneToMany(mappedBy = "vehicle", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<VehicleAvailability> availabilities = new ArrayList<>();

    public Vehicle() {}

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

	public Long getDriverID() {
		return driverID;
	}

	public void setDriverID(Long driverID) {
		this.driverID = driverID;
	}

	public List<VehicleAvailability> getAvailabilities() {
		return availabilities;
	}

	public void setAvailabilities(List<VehicleAvailability> availabilities) {
		this.availabilities = availabilities;
	}

	
}