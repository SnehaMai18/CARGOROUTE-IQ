package com.example.demo.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class ReportDTO {
    private Long reportID;

    @NotNull(message = "Scope is required")
    @Size(max = 50, message = "Scope max length is 50")
    private String scope;

    @Size(max = 1000, message = "ParametersJSON max length is 1000")
    private String parametersJSON;

    @Size(max = 1000, message = "MetricsJSON max length is 1000")
    private String metricsJSON;

    @Size(max = 100, message = "GeneratedBy max length is 100")
    private String generatedBy;

    private String generatedAt;

    // Getters and Setters
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
}