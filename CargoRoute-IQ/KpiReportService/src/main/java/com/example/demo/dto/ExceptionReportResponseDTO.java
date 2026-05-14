package com.example.demo.dto;

/**
 * Response returned after generating an EXCEPTIONS report.
 * metricsJSON: {"totalBookings":420,"totalExceptions":18,"exceptionRate":4.28}
 */
public class ExceptionReportResponseDTO {

    private Long reportID;
    private String scope;           // "EXCEPTIONS"
    private String parametersJSON;  // {"dateFrom":"...","dateTo":"..."}
    private String metricsJSON;     // {"totalBookings":...,"totalExceptions":...,"exceptionRate":...}
    private String generatedBy;
    private String generatedAt;

    // Unpacked summary fields
    private int    totalBookings;
    private int    totalExceptions;
    private double exceptionRate;

    public ExceptionReportResponseDTO() {}

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

    public int getTotalBookings() { return totalBookings; }
    public void setTotalBookings(int totalBookings) { this.totalBookings = totalBookings; }

    public int getTotalExceptions() { return totalExceptions; }
    public void setTotalExceptions(int totalExceptions) { this.totalExceptions = totalExceptions; }

    public double getExceptionRate() { return exceptionRate; }
    public void setExceptionRate(double exceptionRate) { this.exceptionRate = exceptionRate; }
}
