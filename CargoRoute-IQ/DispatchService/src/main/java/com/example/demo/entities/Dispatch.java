package com.example.demo.entities;
import jakarta.persistence.*; 
import java.time.LocalDateTime;
import org.hibernate.annotations.CreationTimestamp;

import com.example.demo.entities.enums.DispatchStatus;

@Entity 
public class Dispatch { 
 
    @Id 		// Primary key
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Auto-increment ID
    private Long dispatchID; // Unique dispatch identifier
    
    private Long loadID;
    
    private Long assignedDriverID; 
 
    private String assignedBy; 
 
    @CreationTimestamp
    private LocalDateTime assignedAt; 
    
    @Enumerated(EnumType.STRING)
    private DispatchStatus status; 
 
    public Dispatch(){} 	// Default constructor
    
    
    // Parameterized constructor to initialize all fields
    public Dispatch(Long dispatchID, Long loadID, Long assignedDriverID, String assignedBy, LocalDateTime assignedAt,
    		DispatchStatus status) {
		super();
		this.dispatchID = dispatchID;
		this.loadID = loadID;
		this.assignedDriverID = assignedDriverID;
		this.assignedBy = assignedBy;
		this.assignedAt = assignedAt;
		this.status = status;
	}


    //getters and setters
	public Long getDispatchID() { 
        return dispatchID; 
    } 
 
    public void setDispatchID(Long dispatchID) { 
        this.dispatchID = dispatchID; 
    } 
 
    public Long getLoadID() { 
        return loadID; 
    } 
 
    public void setLoadID(Long loadID) { 
        this.loadID = loadID; 
    } 
 
    public Long getAssignedDriverID() { 
        return assignedDriverID; 
    } 
 
    public void setAssignedDriverID(Long assignedDriverID) { 
        this.assignedDriverID = assignedDriverID; 
    } 
 
    public String getAssignedBy() { 
        return assignedBy; 
    } 
 
    public void setAssignedBy(String assignedBy) { 
        this.assignedBy = assignedBy; 
    } 
 
    public LocalDateTime getAssignedAt() { 
        return assignedAt; 
    } 
 
    public void setAssignedAt(LocalDateTime assignedAt) { 
        this.assignedAt = assignedAt; 
    } 
 
    public DispatchStatus getStatus() { 
        return status; 
    } 
 
    public void setStatus(DispatchStatus status) { 
        this.status = status; 
    } 
} 
