package com.example.demo.dto;
import java.time.LocalDateTime;
import com.example.demo.entities.enums.BookingStatus;


public class BookingDTO {

    private Long bookingID;
    
    private ShipperDTO shipper;

    private Long originSiteID;

    private Long destinationSiteID;

    private LocalDateTime pickupWindowStart;

    private LocalDateTime pickupWindowEnd;

    private LocalDateTime deliveryWindowStart;

    private LocalDateTime deliveryWindowEnd;

    private Double weightKg;

    private Double volumeM3;

    private Integer pieces;

    private String commodity;

    private String specialHandlingFlags;

    private BookingStatus status;

    private LocalDateTime createdAt;
    
    // Default constructor
    public BookingDTO(){}

    // Getters and Setters

    public Long getBookingID() {
        return bookingID;
    }

    public void setBookingID(Long bookingID) {
        this.bookingID = bookingID;
    }

    public ShipperDTO getShipper() {
        return shipper;
    }

    public void setShipper(ShipperDTO shipper) {
        this.shipper = shipper;
    }

    public Long getOriginSiteID() {
        return originSiteID;
    }

    public void setOriginSiteID(Long originSiteID) {
        this.originSiteID = originSiteID;
    }

    public Long getDestinationSiteID() {
        return destinationSiteID;
    }

    public void setDestinationSiteID(Long destinationSiteID) {
        this.destinationSiteID = destinationSiteID;
    }

    public LocalDateTime getPickupWindowStart() {
        return pickupWindowStart;
    }

    public void setPickupWindowStart(LocalDateTime pickupWindowStart) {
        this.pickupWindowStart = pickupWindowStart;
    }

    public LocalDateTime getPickupWindowEnd() {
        return pickupWindowEnd;
    }

    public void setPickupWindowEnd(LocalDateTime pickupWindowEnd) {
        this.pickupWindowEnd = pickupWindowEnd;
    }

    public LocalDateTime getDeliveryWindowStart() {
        return deliveryWindowStart;
    }

    public void setDeliveryWindowStart(LocalDateTime deliveryWindowStart) {
        this.deliveryWindowStart = deliveryWindowStart;
    }

    public LocalDateTime getDeliveryWindowEnd() {
        return deliveryWindowEnd;
    }

    public void setDeliveryWindowEnd(LocalDateTime deliveryWindowEnd) {
        this.deliveryWindowEnd = deliveryWindowEnd;
    }

    public Double getWeightKg() {
        return weightKg;
    }

    public void setWeightKg(Double weightKg) {
        this.weightKg = weightKg;
    }

    public Double getVolumeM3() {
        return volumeM3;
    }

    public void setVolumeM3(Double volumeM3) {
        this.volumeM3 = volumeM3;
    }

    public Integer getPieces() {
        return pieces;
    }

    public void setPieces(Integer pieces) {
        this.pieces = pieces;
    }

    public String getCommodity() {
        return commodity;
    }

    public void setCommodity(String commodity) {
        this.commodity = commodity;
    }

    public String getSpecialHandlingFlags() {
        return specialHandlingFlags;
    }

    public void setSpecialHandlingFlags(String specialHandlingFlags) {
        this.specialHandlingFlags = specialHandlingFlags;
    }

    public BookingStatus getStatus() {
        return status;
    }

    public void setStatus(BookingStatus status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}