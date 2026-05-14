
package com.example.demo.dto;

import jakarta.validation.constraints.NotNull;

import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;



public class KPIDTO {
    private Long kpiID;

    @NotNull(message = "Name is required")
    private String name;

    private String definition;

    @NotNull(message = "Target is required")
    @Positive(message = "Target must be positive")
    private Double target;

    @NotNull(message = "CurrentValue is required")
    private Double currentValue;

    private String reportingPeriod;

    // Getters and Setters
    public Long getKpiID() { return kpiID; }
    public void setKpiID(Long kpiID) { this.kpiID = kpiID; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDefinition() { return definition; }
    public void setDefinition(String definition) { this.definition = definition; }
    public Double getTarget() { return target; }
    public void setTarget(Double target) { this.target = target; }
    public Double getCurrentValue() { return currentValue; }
    public void setCurrentValue(Double currentValue) { this.currentValue = currentValue; }
    public String getReportingPeriod() { return reportingPeriod; }
    public void setReportingPeriod(String reportingPeriod) { this.reportingPeriod = reportingPeriod; }
}