package com.example.demo.dto;

import java.time.LocalDateTime;

public class LoadDTO {

    private Long loadID;
    private String status;
    private LocalDateTime plannedStart;
    private LocalDateTime plannedEnd;

    private VehicleDTO vehicle; // ✅ NESTED

    public Long getLoadID() {
        return loadID;
    }

    public void setLoadID(Long loadID) {
        this.loadID = loadID;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getPlannedStart() {
        return plannedStart;
    }

    public void setPlannedStart(LocalDateTime plannedStart) {
        this.plannedStart = plannedStart;
    }

    public LocalDateTime getPlannedEnd() {
        return plannedEnd;
    }

    public void setPlannedEnd(LocalDateTime plannedEnd) {
        this.plannedEnd = plannedEnd;
    }

    public VehicleDTO getVehicle() {
        return vehicle;
    }

    public void setVehicle(VehicleDTO vehicle) {
        this.vehicle = vehicle;
    }
}