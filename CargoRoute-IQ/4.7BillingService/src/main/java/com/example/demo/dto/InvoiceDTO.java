
package com.example.demo.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;


import java.time.LocalDateTime;

public class InvoiceDTO {
    private Long invoiceID;

    @NotNull(message = "ShipperID is required")
    private Long shipperID;

    @NotNull(message = "PeriodStart is required")
    private LocalDateTime periodStart;

    @NotNull(message = "PeriodEnd is required")
    private LocalDateTime periodEnd;

    @NotNull(message = "LinesJSON is required")
    private String linesJSON;

    @NotNull(message = "TotalAmount is required")
    @Positive(message = "TotalAmount must be positive")
    private Double totalAmount;

    private LocalDateTime issuedAt;

   
    private String status;

    // Getters and Setters
    public Long getInvoiceID() { return invoiceID; }
    public void setInvoiceID(Long invoiceID) { this.invoiceID = invoiceID; }
    public Long getShipperID() { return shipperID; }
    public void setShipperID(Long shipperID) { this.shipperID = shipperID; }
    public LocalDateTime getPeriodStart() { return periodStart; }
    public void setPeriodStart(LocalDateTime periodStart) { this.periodStart = periodStart; }
    public LocalDateTime getPeriodEnd() { return periodEnd; }
    public void setPeriodEnd(LocalDateTime periodEnd) { this.periodEnd = periodEnd; }
    public String getLinesJSON() { return linesJSON; }
    public void setLinesJSON(String linesJSON) { this.linesJSON = linesJSON; }
    public Double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(Double totalAmount) { this.totalAmount = totalAmount; }
    public LocalDateTime getIssuedAt() { return issuedAt; }
    public void setIssuedAt(LocalDateTime issuedAt) { this.issuedAt = issuedAt; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}