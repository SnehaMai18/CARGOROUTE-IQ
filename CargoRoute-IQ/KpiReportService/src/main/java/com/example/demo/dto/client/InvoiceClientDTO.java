package com.example.demo.dto.client;

import java.time.LocalDateTime;

/**
 * Mirrors BillingService InvoiceDTO — only fields needed for revenue calculation.
 */
public class InvoiceClientDTO {

    private Long invoiceID;
    private Double totalAmount;
    private String status;
    private LocalDateTime issuedAt;
    private LocalDateTime periodStart;
    private LocalDateTime periodEnd;

    public InvoiceClientDTO() {}

    public Long getInvoiceID() { return invoiceID; }
    public void setInvoiceID(Long invoiceID) { this.invoiceID = invoiceID; }

    public Double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(Double totalAmount) { this.totalAmount = totalAmount; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getIssuedAt() { return issuedAt; }
    public void setIssuedAt(LocalDateTime issuedAt) { this.issuedAt = issuedAt; }

    public LocalDateTime getPeriodStart() { return periodStart; }
    public void setPeriodStart(LocalDateTime periodStart) { this.periodStart = periodStart; }

    public LocalDateTime getPeriodEnd() { return periodEnd; }
    public void setPeriodEnd(LocalDateTime periodEnd) { this.periodEnd = periodEnd; }
}
