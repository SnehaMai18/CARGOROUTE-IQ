package com.example.demo.dto;


public class BillingLineDTO {

   
    private Long billingLineID;

    private Long bookingID;

    private Long loadID;

    private Double amount;

    private String tariffApplied;

    private String notes;

   
    public Long getBillingLineID() {
        return billingLineID;
    }

    public void setBillingLineID(Long billingLineID) {
        this.billingLineID = billingLineID;
    }

    public Long getBookingID() {
        return bookingID;
    }

    public void setBookingID(Long bookingID) {
        this.bookingID = bookingID;
    }

    public Long getLoadID() {
        return loadID;
    }

    public void setLoadID(Long loadID) {
        this.loadID = loadID;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
    }

    public String getTariffApplied() {
        return tariffApplied;
    }

    public void setTariffApplied(String tariffApplied) {
        this.tariffApplied = tariffApplied;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}