package com.example.demo.dto;

/**
 * Response returned after generating an ON-TIME report.
 * Includes the persisted report metadata + the calculated metrics.
 */
public class OnTimeReportResponseDTO {

    private Long reportID;
    private String scope;                  // "ONTIME"
    private String parametersJSON;         // {"dateFrom":"...","dateTo":"..."}
    private String metricsJSON;            // {"totalBookings":N,"onTimeBookings":M,"onTimePercentage":"PP.PP%"}
    private String generatedBy;            // "Mamatha (ANALYST)"
    private String generatedAt;            // ISO timestamp
    // private String reportURI;

    // Summary fields (unpacked from metricsJSON for convenience)
//    private int totalBookings;
//    private int onTimeBookings;
//    private String onTimePercentage;

    public OnTimeReportResponseDTO() {}

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

//    public int getTotalBookings() { return totalBookings; }
//    public void setTotalBookings(int totalBookings) { this.totalBookings = totalBookings; }
//
//    public int getOnTimeBookings() { return onTimeBookings; }
//    public void setOnTimeBookings(int onTimeBookings) { this.onTimeBookings = onTimeBookings; }
//
//    public String getOnTimePercentage() { return onTimePercentage; }
//    public void setOnTimePercentage(String onTimePercentage) { this.onTimePercentage = onTimePercentage; }
}
