package com.example.demo.dto;

import jakarta.validation.constraints.NotNull;

/**
 * Request body for generating an EXCEPTIONS report.
 * dateFrom / dateTo filter exceptions by reportedAt date.
 */
public class ExceptionReportRequestDTO {

    @NotNull(message = "dateFrom is required (yyyy-MM-dd)")
    private String dateFrom;

    @NotNull(message = "dateTo is required (yyyy-MM-dd)")
    private String dateTo;

    public ExceptionReportRequestDTO() {}

    public String getDateFrom() { return dateFrom; }
    public void setDateFrom(String dateFrom) { this.dateFrom = dateFrom; }

    public String getDateTo() { return dateTo; }
    public void setDateTo(String dateTo) { this.dateTo = dateTo; }
}
