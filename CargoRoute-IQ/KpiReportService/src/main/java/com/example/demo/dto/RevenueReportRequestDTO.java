package com.example.demo.dto;

import jakarta.validation.constraints.NotNull;

/**
 * Request body for generating a REVENUE report.
 * Filters invoices by issuedAt date range.
 */
public class RevenueReportRequestDTO {

    @NotNull(message = "dateFrom is required (yyyy-MM-dd)")
    private String dateFrom;

    @NotNull(message = "dateTo is required (yyyy-MM-dd)")
    private String dateTo;

    public RevenueReportRequestDTO() {}

    public String getDateFrom() { return dateFrom; }
    public void setDateFrom(String dateFrom) { this.dateFrom = dateFrom; }

    public String getDateTo() { return dateTo; }
    public void setDateTo(String dateTo) { this.dateTo = dateTo; }
}
