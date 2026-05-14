package com.example.demo.dto; 
import java.time.LocalDateTime;


public class HandoverDTO { 
	
   private Long handoverID; 		// Unique identifier for the handover record
  
   private Long manifestID; 
   
   private String handedBy; 

   private LocalDateTime handedAt; 

   private String receivedBy; 

   private LocalDateTime receivedAt; 

   private String notes; 


   //getters and setters
   public Long getHandoverID() { 
       return handoverID; 
   } 

   public void setHandoverID(Long handoverID) { 
       this.handoverID = handoverID; 
   } 


   public Long getManifestID() {
	return manifestID;
}

   public void setManifestID(Long manifestID) {
	this.manifestID = manifestID;
   }

   public String getHandedBy() { 
       return handedBy; 
   } 

   public void setHandedBy(String handedBy) { 
       this.handedBy = handedBy; 
   } 

   public LocalDateTime getHandedAt() { 
       return handedAt; 
   } 

   public void setHandedAt(LocalDateTime handedAt) { 
       this.handedAt = handedAt; 
   } 

   public String getReceivedBy() { 
       return receivedBy; 
   } 

   public void setReceivedBy(String receivedBy) { 
       this.receivedBy = receivedBy; 
   } 

   public LocalDateTime getReceivedAt() { 
       return receivedAt; 
   } 

   public void setReceivedAt(LocalDateTime receivedAt) { 
       this.receivedAt = receivedAt; 
   } 

   public String getNotes() { 
       return notes; 
   } 

   public void setNotes(String notes) { 
       this.notes = notes; 
   } 
} 