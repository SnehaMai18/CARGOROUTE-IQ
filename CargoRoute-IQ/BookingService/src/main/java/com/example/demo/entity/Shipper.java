package com.example.demo.entity;

import com.example.demo.entity.enums.ShipperStatus;

import jakarta.persistence.*;

@Entity
public class Shipper {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long shipperID;

    private String name;
    private String contactInfo;
    private String accountTerms;
    private ShipperStatus status;

    public Shipper() {}

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