package com.example.demo.entity;
// Declares the package where this class resides, grouping it under 'entities'.

import jakarta.persistence.*; 
// Imports JPA annotations and persistence classes from Jakarta Persistence API.

import java.time.LocalDate; 
// Imports LocalDate for date-only fields.

@Entity 
// Marks this class as a JPA entity, mapping it to a database table.

public class Tariff { 
// Declares the public class 'Tariff' representing tariff records in the database.

    @Id 
    // Specifies the primary key field of the entity.

    @GeneratedValue(strategy = GenerationType.IDENTITY) 
    // Configures auto-generation of the primary key using the database identity column.

    private Long tariffID; 
    // Field for the unique identifier of each tariff record.

    private String serviceType; 
    // Field to store the type of service (e.g., "Air Freight", "Sea Freight").

    private Double ratePerKg; 
    // Field to store the rate charged per kilogram.

    private Double ratePerM3; 
    // Field to store the rate charged per cubic meter.

    private Double minCharge; 
    // Field to store the minimum charge applicable regardless of weight/volume.

    private LocalDate effectiveFrom; 
    // Field to store the start date when the tariff becomes effective.

    private LocalDate effectiveTo; 
    // Field to store the end date until which the tariff is valid.

    private String status; 
    // Field to store the current status of the tariff (e.g., "Active", "Expired").

    public Tariff(){} 
    // Default no-argument constructor required by JPA.

    public Long getTariffID() { 
        return tariffID; 
    } 
    // Getter method for tariffID.

    public void setTariffID(Long tariffID) { 
        this.tariffID = tariffID; 
    } 
    // Setter method for tariffID.

    public String getServiceType() { 
        return serviceType; 
    } 
    // Getter method for serviceType.

    public void setServiceType(String serviceType) { 
        this.serviceType = serviceType; 
    } 
    // Setter method for serviceType.

    public Double getRatePerKg() { 
        return ratePerKg; 
    } 
    // Getter method for ratePerKg.

    public void setRatePerKg(Double ratePerKg) { 
        this.ratePerKg = ratePerKg; 
    } 
    // Setter method for ratePerKg.

    public Double getRatePerM3() { 
        return ratePerM3; 
    } 
    // Getter method for ratePerM3.

    public void setRatePerM3(Double ratePerM3) { 
        this.ratePerM3 = ratePerM3; 
    } 
    // Setter method for ratePerM3.

    public Double getMinCharge() { 
        return minCharge; 
    } 
    // Getter method for minCharge.

    public void setMinCharge(Double minCharge) { 
        this.minCharge = minCharge; 
    } 
    // Setter method for minCharge.

    public LocalDate getEffectiveFrom() { 
        return effectiveFrom; 
    } 
    // Getter method for effectiveFrom.

    public void setEffectiveFrom(LocalDate effectiveFrom) { 
        this.effectiveFrom = effectiveFrom; 
    } 
    // Setter method for effectiveFrom.

    public LocalDate getEffectiveTo() { 
        return effectiveTo; 
    } 
    // Getter method for effectiveTo.

    public void setEffectiveTo(LocalDate effectiveTo) { 
        this.effectiveTo = effectiveTo; 
    } 
    // Setter method for effectiveTo.

    public String getStatus() { 
        return status; 
    } 
    // Getter method for status.

    public void setStatus(String status) { 
        this.status = status; 
    } 
    // Setter method for status.
} 

