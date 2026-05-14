package com.example.demo.dto;

/**
 * Request DTO for computing a KPI value.
 *
 * name            – one of: Utilization | OnTime | Revenue | Exceptions
 * target          – 90.0 or 95.0 (selectable from frontend)
 * reportingPeriod – one of: Monthly | Quarterly | Yearly
 */
public class KpiComputeRequestDTO {

    private String name;           // KPI name (maps to ReportScope)
    private Double target;         // 90 or 95
    private String reportingPeriod; // Monthly | Quarterly | Yearly

    public KpiComputeRequestDTO() {}

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Double getTarget() { return target; }
    public void setTarget(Double target) { this.target = target; }

    public String getReportingPeriod() { return reportingPeriod; }
    public void setReportingPeriod(String reportingPeriod) { this.reportingPeriod = reportingPeriod; }
}
