package com.example.demo.dto;

import com.example.demo.enums.ShipperStatus;

public class ShipperDTO {

    private Long shipperID;

    private String name;
    private String contactInfo;
    private String accountTerms;
    private ShipperStatus status;

    public ShipperDTO() {}

    public Long getShipperID() {
        return shipperID;
    }

    public void setShipperID(Long shipperID) {
        this.shipperID = shipperID;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getContactInfo() {
        return contactInfo;
    }

    public void setContactInfo(String contactInfo) {
        this.contactInfo = contactInfo;
    }

    public String getAccountTerms() {
        return accountTerms;
    }

    public void setAccountTerms(String accountTerms) {
        this.accountTerms = accountTerms;
    }

    public ShipperStatus getStatus() {
        return status;
    }

    public void setStatus(ShipperStatus status) {
        this.status = status;
    }
}