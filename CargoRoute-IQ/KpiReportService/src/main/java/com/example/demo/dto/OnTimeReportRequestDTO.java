package com.example.demo.dto;

import jakarta.validation.constraints.NotNull;

/**
 * Request body for generating an ON-TIME delivery report.
 * Only dateFrom and dateTo are required from the frontend (date pickers).
 * generatedBy user info is resolved automatically from the X-User-Id header.
 */
public class OnTimeReportRequestDTO {

    @NotNull(message = "dateFrom is required (yyyy-MM-dd)")
    private String dateFrom;

    @NotNull(message = "dateTo is required (yyyy-MM-dd)")
    private String dateTo;

    public OnTimeReportRequestDTO() {}

    public String getDateFrom() { return dateFrom; }
    public void setDateFrom(String dateFrom) { this.dateFrom = dateFrom; }

    public String getDateTo() { return dateTo; }
    public void setDateTo(String dateTo) { this.dateTo = dateTo; }
}
