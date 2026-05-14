package com.example.demo.dto.client;

/**
 * Mirrors FleetService's VehicleDTO — only fields needed for utilization calculation.
 */
public class VehicleClientDTO {

    private Long vehicleID;
    private String regNumber;
    private Double maxWeightKg;
    private Double maxVolumeM3;
    private String status;

    public VehicleClientDTO() {}

    public Long getVehicleID() { return vehicleID; }
    public void setVehicleID(Long vehicleID) { this.vehicleID = vehicleID; }

    public String getRegNumber() { return regNumber; }
    public void setRegNumber(String regNumber) { this.regNumber = regNumber; }

    public Double getMaxWeightKg() { return maxWeightKg; }
    public void setMaxWeightKg(Double maxWeightKg) { this.maxWeightKg = maxWeightKg; }

    public Double getMaxVolumeM3() { return maxVolumeM3; }
    public void setMaxVolumeM3(Double maxVolumeM3) { this.maxVolumeM3 = maxVolumeM3; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
