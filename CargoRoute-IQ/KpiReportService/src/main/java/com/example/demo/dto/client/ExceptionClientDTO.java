package com.example.demo.dto.client;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/**
 * Mirrors ExceptionService ExceptionRecordDTO.
 * reportedAt may arrive as a LocalDateTime array [y,m,d,h,min,s,ns] or ISO string.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class ExceptionClientDTO {

    private Long exceptionID;
    private String type;
    private String status;
    private String reportedBy;
    private Object reportedAt;   // handles both array and string from Jackson
    private Long bookingId;

    public ExceptionClientDTO() {}

    public Long getExceptionID() { return exceptionID; }
    public void setExceptionID(Long exceptionID) { this.exceptionID = exceptionID; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getReportedBy() { return reportedBy; }
    public void setReportedBy(String reportedBy) { this.reportedBy = reportedBy; }

    public Object getReportedAt() { return reportedAt; }
    public void setReportedAt(Object reportedAt) { this.reportedAt = reportedAt; }

    public Long getBookingId() { return bookingId; }
    public void setBookingId(Long bookingId) { this.bookingId = bookingId; }
}
