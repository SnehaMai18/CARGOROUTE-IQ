package com.example.demo.dto.client;

import java.time.LocalDateTime;

/**
 * Local mirror of BookingService's BookingDTO.
 * Fields used: bookingID, deliveryWindowEnd, createdAt.
 */
public class BookingClientDTO {

    private Long bookingID;
    private LocalDateTime deliveryWindowStart;
    private LocalDateTime deliveryWindowEnd;
    private LocalDateTime createdAt;
    private String status;

    public BookingClientDTO() {}

    public Long getBookingID() { return bookingID; }
    public void setBookingID(Long bookingID) { this.bookingID = bookingID; }

    public LocalDateTime getDeliveryWindowStart() { return deliveryWindowStart; }
    public void setDeliveryWindowStart(LocalDateTime deliveryWindowStart) { this.deliveryWindowStart = deliveryWindowStart; }

    public LocalDateTime getDeliveryWindowEnd() { return deliveryWindowEnd; }
    public void setDeliveryWindowEnd(LocalDateTime deliveryWindowEnd) { this.deliveryWindowEnd = deliveryWindowEnd; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
