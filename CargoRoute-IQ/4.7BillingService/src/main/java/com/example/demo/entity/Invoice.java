package com.example.demo.entity;
// Declares the package where this class belongs, grouping it under 'entities'.

import java.time.LocalDateTime; 
// Imports LocalDateTime for timestamp fields (date + time).

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

import java.time.LocalDate; 
// Imports LocalDate for date-only fields.

@Entity
// Marks this class as a JPA entity, mapping it to a database table.

public class Invoice { 
// Declares the public class 'Invoice' representing an invoice record in the database.

    @Id
    // Specifies the primary key field of the entity.

    @GeneratedValue(strategy = GenerationType.IDENTITY) 
    // Configures auto-generation of the primary key using the database identity column.

    private Long invoiceID; 
    // Field for the unique identifier of each invoice.

    private Long shipperID; 
    // Field to store the associated shipper ID (foreign key reference in business logic).

    private LocalDate periodStart; 
    // Field to store the start date of the billing period.

    private LocalDate periodEnd; 
    // Field to store the end date of the billing period.

    @Column(columnDefinition = "TEXT") 
    // Specifies that the column should be stored as TEXT in the database (for large JSON strings).

    private String linesJSON; 
    // Field to store billing line details in JSON format.

    private Double totalAmount; 
    // Field to store the total monetary amount of the invoice.

    private LocalDateTime issuedAt; 
    // Field to store the timestamp when the invoice was issued.

    private String status; 
    // Field to store the current status of the invoice (e.g., "Pending", "Paid").

    public Invoice(){} 
    // Default no-argument constructor required by JPA.

    public Long getInvoiceID() { 
        return invoiceID; 
    } 
    // Getter method for invoiceID.

    public void setInvoiceID(Long invoiceID) { 
        this.invoiceID = invoiceID; 
    } 
    // Setter method for invoiceID.

    public Long getShipperID() { 
        return shipperID; 
    } 
    // Getter method for shipperID.

    public void setShipperID(Long shipperID) { 
        this.shipperID = shipperID; 
    } 
    // Setter method for shipperID.

    public LocalDate getPeriodStart() { 
        return periodStart; 
    } 
    // Getter method for periodStart.

    public void setPeriodStart(LocalDate periodStart) { 
        this.periodStart = periodStart; 
    } 
    // Setter method for periodStart.

    public LocalDate getPeriodEnd() { 
        return periodEnd; 
    } 
    // Getter method for periodEnd.

    public void setPeriodEnd(LocalDate periodEnd) { 
        this.periodEnd = periodEnd; 
    } 
    // Setter method for periodEnd.

    public String getLinesJSON() { 
        return linesJSON; 
    } 
    // Getter method for linesJSON.

    public void setLinesJSON(String linesJSON) { 
        this.linesJSON = linesJSON; 
    } 
    // Setter method for linesJSON.

    public Double getTotalAmount() { 
        return totalAmount; 
    } 
    // Getter method for totalAmount.

    public void setTotalAmount(Double totalAmount) { 
        this.totalAmount = totalAmount; 
    } 
    // Setter method for totalAmount.

    public LocalDateTime getIssuedAt() { 
        return issuedAt; 
    } 
    // Getter method for issuedAt.

    public void setIssuedAt(LocalDateTime issuedAt) { 
        this.issuedAt = issuedAt; 
    } 
    // Setter method for issuedAt.

    public String getStatus() { 
        return status; 
    } 
    // Getter method for status.

    public void setStatus(String status) { 
        this.status = status; 
    } 
    // Setter method for status.
} 
// End of the Invoice entity class.
