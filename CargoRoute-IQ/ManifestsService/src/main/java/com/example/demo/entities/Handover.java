package com.example.demo.entities;

import jakarta.persistence.*; 

import java.time.LocalDateTime;
 
import org.hibernate.annotations.CreationTimestamp;
 
@Entity 

public class Handover {
 
   @Id 			// Primary key

   @GeneratedValue(strategy = GenerationType.IDENTITY) 			// Auto-increment ID

   private Long handoverID; 		// Unique identifier for the handover record

   @ManyToOne

   @JoinColumn(name="manifest_id")	

   private Manifest manifest; 

   private String handedBy;
 
   @CreationTimestamp

   private LocalDateTime handedAt;
 
   private String receivedBy;
 
   @CreationTimestamp

   private LocalDateTime receivedAt;
 
   private String notes;
 
   public Handover(){} 	// Default constructor


   // Parameterized constructor to initialize all fields

   public Handover(Long handoverID, Manifest manifest, String handedBy, LocalDateTime handedAt, String receivedBy,

		LocalDateTime receivedAt, String notes) {

	super();

	this.handoverID = handoverID;

	this.manifest = manifest;

	this.handedBy = handedBy;

	this.handedAt = handedAt;

	this.receivedBy = receivedBy;

	this.receivedAt = receivedAt;

	this.notes = notes;

}
 
 
   //getters and setters

   public Long getHandoverID() { 

       return handoverID; 

   }
 
   public void setHandoverID(Long handoverID) { 

       this.handoverID = handoverID; 

   }
 
   public Manifest getManifest() { 

       return manifest; 

   }
 
   public void setManifest(Manifest manifest) { 

       this.manifest = manifest; 

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
 
 
 