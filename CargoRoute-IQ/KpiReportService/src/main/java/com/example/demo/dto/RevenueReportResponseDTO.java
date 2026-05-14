package com.example.demo.dto;

/**
 * Response returned after generating a REVENUE report.
 * metricsJSON: {"totalRevenue":15500.0,"totalDistanceKm":0.0,"revenuePerKm":0.0}
 */
public class RevenueReportResponseDTO {

    private Long reportID;
    private String scope;           // "REVENUE"
    private String parametersJSON;  // {"dateFrom":"...","dateTo":"..."}
    private String metricsJSON;     // {"totalRevenue":...,"totalDistanceKm":...,"revenuePerKm":...}
    private String generatedBy;
    private String generatedAt;

    // Unpacked summary fields
    private double totalRevenue;
    private double totalDistanceKm;
    private double revenuePerKm;
    private int totalInvoices;

    public RevenueReportResponseDTO() {}

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

    public double getTotalRevenue() { return totalRevenue; }
    public void setTotalRevenue(double totalRevenue) { this.totalRevenue = totalRevenue; }

    public double getTotalDistanceKm() { return totalDistanceKm; }
    public void setTotalDistanceKm(double totalDistanceKm) { this.totalDistanceKm = totalDistanceKm; }

    public double getRevenuePerKm() { return revenuePerKm; }
    public void setRevenuePerKm(double revenuePerKm) { this.revenuePerKm = revenuePerKm; }

    public int getTotalInvoices() { return totalInvoices; }
    public void setTotalInvoices(int totalInvoices) { this.totalInvoices = totalInvoices; }
}
