package com.example.demo.entities;
import jakarta.persistence.*; 
import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp; 
 
@Entity 
public class DriverAck { 
 
    @Id 	// Primary key
    @GeneratedValue(strategy = GenerationType.IDENTITY) 	// Auto-increment ID
    private Long ackID; 	// Unique identifier for the acknowledgement record
    
    @ManyToOne
    @JoinColumn(name="dispatch_id")		// Foreign key column linking to Dispatch table
    private Dispatch dispatch;
    
    @ManyToOne
    @JoinColumn(name="driver_id")		// Foreign key column linking to Driver table
    private Driver driver; 
 
    @CreationTimestamp
    private LocalDateTime ackAt; 
 
    private String notes; 
 
    public DriverAck(){}

	public DriverAck(Long ackID, Dispatch dispatch, Driver driver, LocalDateTime ackAt, String notes) {
		super();
		this.ackID = ackID;
		this.dispatch = dispatch;
		this.driver = driver;
		this.ackAt = ackAt;
		this.notes = notes;
	}

	public Long getAckID() {
		return ackID;
	}

	public void setAckID(Long ackID) {
		this.ackID = ackID;
	}

	public Dispatch getDispatch() {
		return dispatch;
	}

	public void setDispatch(Dispatch dispatch) {
		this.dispatch = dispatch;
	}

	public Driver getDriver() {
		return driver;
	}

	public void setDriver(Driver driver) {
		this.driver = driver;
	}

	public LocalDateTime getAckAt() {
		return ackAt;
	}

	public void setAckAt(LocalDateTime ackAt) {
		this.ackAt = ackAt;
	}

	public String getNotes() {
		return notes;
	}

	public void setNotes(String notes) {
		this.notes = notes;
	}
    
} 