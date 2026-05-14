package com.example.demo.dto;

/**
 * Response returned after generating a Fleet UTILIZATION report.
 * metricsJSON shape: {"totalFleetCapacityKg":10000,"usedCapacityKg":7800,"fleetUtilizationPercentage":78.0}
 */
public class UtilizationReportResponseDTO {

    private Long reportID;
    private String scope;              // "UTILIZATION"
    private String parametersJSON;    // {"dateFrom":"...","dateTo":"..."}
    private String metricsJSON;       // {"totalFleetCapacityKg":...,"usedCapacityKg":...,"fleetUtilizationPercentage":...}
    private String generatedBy;
    private String generatedAt;

    // Summary fields (unpacked from metricsJSON for frontend convenience)
    private double totalFleetCapacityKg;
    private double usedCapacityKg;
    private String fleetUtilizationPercentage;

    public UtilizationReportResponseDTO() {}

    public Long getReportID() { return reportID; }
    public void setReportID(Long reportID) { this.reportID = reportID; }

    public String getScope() { return scope; }
    public void setScope(String scope) { this.scope = scope; }

    public String getParametersJSON() { return parametersJSON; }
    public void setParametersJSON(String parametersJSON) { this.parametersJSON = parametersJSON; }

    public String getMetricsJSON() { return metricsJSON; }
    public void setMetricsJSON(String metricsJSON) { this.metricsJSON = metricsJSON; }

    public String getGeneratedBy() { return generatedBy; }
    public void setGeneratedBy(String generatedBy) { this.generatedBy = generatedBy; }

    public String getGeneratedAt() { return generatedAt; }
    public void setGeneratedAt(String generatedAt) { this.generatedAt = generatedAt; }

    public double getTotalFleetCapacityKg() { return totalFleetCapacityKg; }
    public void setTotalFleetCapacityKg(double totalFleetCapacityKg) { this.totalFleetCapacityKg = totalFleetCapacityKg; }

    public double getUsedCapacityKg() { return usedCapacityKg; }
    public void setUsedCapacityKg(double usedCapacityKg) { this.usedCapacityKg = usedCapacityKg; }

    public String getFleetUtilizationPercentage() { return fleetUtilizationPercentage; }
    public void setFleetUtilizationPercentage(String fleetUtilizationPercentage) { this.fleetUtilizationPercentage = fleetUtilizationPercentage; }
}
