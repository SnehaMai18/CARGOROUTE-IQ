package com.example.demo.entities;

import jakarta.persistence.*; 

import java.time.LocalDateTime;
 
import org.hibernate.annotations.CreationTimestamp;
 
@Entity 

public class Manifest {
 
   @Id 		// Primary key

   @GeneratedValue(strategy = GenerationType.IDENTITY) 	// Auto-increment ID

   private Long manifestID; 	// Unique identifier for the manifest record
 
   private Long loadID;
 
   private Long warehouseID;
 
   private String itemsJSON;
 
   private String createdBy;
 
   @CreationTimestamp

   private LocalDateTime createdAt;
 
   private String manifestURI;
 
   public Manifest(){} 	// Default constructor


   // Parameterized constructor to initialize all fields

   public Manifest(Long manifestID, Long loadID, Long warehouseID, String itemsJSON, String createdBy,

		LocalDateTime createdAt, String manifestURI) {

	super();

	this.manifestID = manifestID;

	this.loadID = loadID;

	this.warehouseID = warehouseID;

	this.itemsJSON = itemsJSON;

	this.createdBy = createdBy;

	this.createdAt = createdAt;

	this.manifestURI = manifestURI;

}
 
 
   //getters and setters

   public Long getManifestID() { 

       return manifestID; 

   }
 
   public void setManifestID(Long manifestID) { 

       this.manifestID = manifestID; 

   }
 
   public Long getLoadID() { 

       return loadID; 

   }
 
   public void setLoadID(Long loadID) { 

       this.loadID = loadID; 

   }
 
   public Long getWarehouseID() { 

       return warehouseID; 

   }
 
   public void setWarehouseID(Long warehouseID) { 

       this.warehouseID = warehouseID; 

   }
 
   public String getItemsJSON() { 

       return itemsJSON; 

   }
 
   public void setItemsJSON(String itemsJSON) { 

       this.itemsJSON = itemsJSON; 

   }
 
   public String getCreatedBy() { 

       return createdBy; 

   }
 
   public void setCreatedBy(String createdBy) { 

       this.createdBy = createdBy; 

   }
 
   public LocalDateTime getCreatedAt() { 

       return createdAt; 

   }
 
   public void setCreatedAt(LocalDateTime createdAt) { 

       this.createdAt = createdAt; 

   }
 
   public String getManifestURI() { 

       return manifestURI; 

   }
 
   public void setManifestURI(String manifestURI) { 

       this.manifestURI = manifestURI; 

   } 

}
 