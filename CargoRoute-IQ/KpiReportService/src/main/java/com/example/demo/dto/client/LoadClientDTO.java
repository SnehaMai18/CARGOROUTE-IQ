package com.example.demo.dto.client;

import java.time.LocalDateTime;

/**
 * Mirrors RoutingService's LoadDTO — fields needed for utilization calculation.
 */
public class LoadClientDTO {

    private Long loadID;
    private String loadCode;
    private Long vehicleID;
    private LocalDateTime plannedStart;
    private LocalDateTime plannedEnd;
    private Double totalWeightKg;
    private Double totalVolumeM3;
    private String status;

    public LoadClientDTO() {}

    public Long getLoadID() { return loadID; }
    public void setLoadID(Long loadID) { this.loadID = loadID; }

    public String getLoadCode() { return loadCode; }
    public void setLoadCode(String loadCode) { this.loadCode = loadCode; }

    public Long getVehicleID() { return vehicleID; }
    public void setVehicleID(Long vehicleID) { this.vehicleID = vehicleID; }

    public LocalDateTime getPlannedStart() { return plannedStart; }
    public void setPlannedStart(LocalDateTime plannedStart) { this.plannedStart = plannedStart; }

    public LocalDateTime getPlannedEnd() { return plannedEnd; }
    public void setPlannedEnd(LocalDateTime plannedEnd) { this.plannedEnd = plannedEnd; }

    public Double getTotalWeightKg() { return totalWeightKg; }
    public void setTotalWeightKg(Double totalWeightKg) { this.totalWeightKg = totalWeightKg; }

    public Double getTotalVolumeM3() { return totalVolumeM3; }
    public void setTotalVolumeM3(Double totalVolumeM3) { this.totalVolumeM3 = totalVolumeM3; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
