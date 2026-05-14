package com.example.demo.dto;

import jakarta.validation.constraints.NotNull;

/**
 * Request body for generating a Fleet UTILIZATION report.
 * Only dateFrom and dateTo are required (load plannedStart date range filter).
 */
public class UtilizationReportRequestDTO {

    @NotNull(message = "dateFrom is required (yyyy-MM-dd)")
    private String dateFrom;

    @NotNull(message = "dateTo is required (yyyy-MM-dd)")
    private String dateTo;

    public UtilizationReportRequestDTO() {}

    public String getDateFrom() { return dateFrom; }
    public void setDateFrom(String dateFrom) { this.dateFrom = dateFrom; }

    public String getDateTo() { return dateTo; }
    public void setDateTo(String dateTo) { this.dateTo = dateTo; }
}
