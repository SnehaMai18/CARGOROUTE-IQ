package com.example.demo.dto.client;

import java.time.LocalDateTime;

/**
 * Local mirror of ManifestService's ProofOfDeliveryDTO.
 * Fields used: podID, bookingID, deliveredAt.
 */
public class ProofOfDeliveryClientDTO {

    private Long podID;
    private Long bookingID;
    private LocalDateTime deliveredAt;
    private String status;

    public ProofOfDeliveryClientDTO() {}

    public Long getPodID() { return podID; }
    public void setPodID(Long podID) { this.podID = podID; }

    public Long getBookingID() { return bookingID; }
    public void setBookingID(Long bookingID) { this.bookingID = bookingID; }

    public LocalDateTime getDeliveredAt() { return deliveredAt; }
    public void setDeliveredAt(LocalDateTime deliveredAt) { this.deliveredAt = deliveredAt; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
