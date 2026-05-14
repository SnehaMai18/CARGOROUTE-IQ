package com.example.demo.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

import com.example.demo.entity.enums.BookingStatus;

@Entity // Marks this class as a JPA entity mapped to a "booking" table (by default, table name is class name)
public class Booking {

    @Id // Primary key
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Auto-increment PK 
    private Long bookingID;
    
    @ManyToOne
    @JoinColumn(name = "shipperID", nullable = false) 
    // Foreign key column name; NOT NULL enforces a booking must have a shipper
   
    private Shipper shipper;

    // Origin location/site identifier 
    private Long originSiteID;

    // Destination location/site identifier
    private Long destinationSiteID;

    // Requested pickup window start time
    private LocalDateTime pickupWindowStart;

    // Requested pickup window end time
    private LocalDateTime pickupWindowEnd;

    // Requested delivery window start time
    private LocalDateTime deliveryWindowStart;

    // Requested delivery window end time
    private LocalDateTime deliveryWindowEnd;

    // Total shipment weight in kilograms
    private Double weightKg;

    // Total shipment volume in cubic meters
    private Double volumeM3;

    // Number of pieces/parcels in this booking
    private Integer pieces;

    // Commodity/description of goods (e.g., "Electronics")
    private String commodity;

    // CSV/flags for special handling (e.g., "HAZMAT,FRAGILE")
    private String specialHandlingFlags;

    @Enumerated(EnumType.STRING) // Store enum as String in DB (e.g., NEW, CONFIRMED, CANCELLED) for readability and schema stability
    private BookingStatus status;

    /**
     * IAM username (JWT 'sub') of the user who created this booking.
     * Set server-side during booking creation — never accepted from the frontend.
     * Used to enforce Shipper-level visibility: Shippers only see bookings they created.
     */
    @Column(name = "created_by_user_id")
    private Long createdByUserId;

    @CreationTimestamp // Automatically set on insert by Hibernate; do not manually set in code
    private LocalDateTime createdAt;
    
    // Default constructor required by JPA
    public Booking(){}

    // --- Getters and Setters ---

    public Long getBookingID() {
        return bookingID;
    }

    public void setBookingID(Long bookingID) {
        this.bookingID = bookingID;
    }

    public Shipper getShipper() {
        return shipper;
    }

    public void setShipper(Shipper shipper) {
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

    public Long getCreatedByUserId() {
        return createdByUserId;
    }

    public void setCreatedByUserId(Long createdByUserId) {
        this.createdByUserId = createdByUserId;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

}
