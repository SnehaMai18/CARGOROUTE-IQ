package com.example.demo.dto;

public class BillingLineResponseDTO {

    private BillingLineDTO billing;
    private BookingDTO booking;
    private RequiredResponseDTO load;

    public BillingLineDTO getBilling() {
        return billing;
    }

    public void setBilling(BillingLineDTO billing) {
        this.billing = billing;
    }

    public BookingDTO getBooking() {
        return booking;
    }

    public void setBooking(BookingDTO booking) {
        this.booking = booking;
    }

    public RequiredResponseDTO getLoad() {
        return load;
    }

    public void setLoad(RequiredResponseDTO load) {
        this.load = load;
    }
}