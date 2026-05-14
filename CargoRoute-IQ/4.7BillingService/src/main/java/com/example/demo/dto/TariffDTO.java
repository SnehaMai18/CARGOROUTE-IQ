
package com.example.demo.dto;

import java.time.LocalDate;


import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public class TariffDTO {
    private Long tariffID;

    @NotNull(message = "ServiceType is required")
    private String serviceType;

    @NotNull(message = "RatePerKg is required")
    @Positive(message = "RatePerKg must be positive")
    private Double ratePerKg;

    @NotNull(message = "RatePerM3 is required")
    @Positive(message = "RatePerM3 must be positive")
    private Double ratePerM3;

    @NotNull(message = "MinCharge is required")
    @Positive(message = "MinCharge must be positive")
    private Double minCharge;

    @NotNull(message = "EffectiveFrom is required")
    private LocalDate effectiveFrom;

    @NotNull(message = "EffectiveTo is required")
    private LocalDate effectiveTo;

    private String status;

    // Getters and Setters
    public Long getTariffID() { return tariffID; }
    public void setTariffID(Long tariffID) { this.tariffID = tariffID; }
    public String getServiceType() { return serviceType; }
    public void setServiceType(String serviceType) { this.serviceType = serviceType; }
    public Double getRatePerKg() { return ratePerKg; }
    public void setRatePerKg(Double ratePerKg) { this.ratePerKg = ratePerKg; }
    public Double getRatePerM3() { return ratePerM3; }
    public void setRatePerM3(Double ratePerM3) { this.ratePerM3 = ratePerM3; }
    public Double getMinCharge() { return minCharge; }
    public void setMinCharge(Double minCharge) { this.minCharge = minCharge; }
    public LocalDate getEffectiveFrom() { return effectiveFrom; }
    public void setEffectiveFrom(LocalDate effectiveFrom) { this.effectiveFrom = effectiveFrom; }
    public LocalDate getEffectiveTo() { return effectiveTo; }
    public void setEffectiveTo(LocalDate effectiveTo) { this.effectiveTo = effectiveTo; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}