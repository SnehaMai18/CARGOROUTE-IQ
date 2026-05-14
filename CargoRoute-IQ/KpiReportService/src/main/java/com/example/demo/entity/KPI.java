package com.example.demo.entity;
// Declares the package where this class resides, grouping it under 'entities'.

import jakarta.persistence.*; 
// Imports JPA annotations and persistence classes from Jakarta Persistence API.

@Entity 
@Table(name = "kpi")
// Marks this class as a JPA entity, mapping it to the 'kpi' database table.

public class KPI { 
// Declares the public class 'KPI' representing a Key Performance Indicator record.

   @Id 
   // Specifies the primary key field of the entity.

   @GeneratedValue(strategy = GenerationType.IDENTITY) 
   // Configures auto-generation of the primary key using the database identity column.

   private Long KPIID; 
   // Field for the unique identifier of each KPI record.

   private String name; 
   // Field to store the name of the KPI.

   private String definition; 
   // Field to store the definition or description of the KPI.

   private Double target; 
   // Field to store the target value for the KPI.

   private Double currentValue; 
   // Field to store the current measured value of the KPI.

   private String reportingPeriod; 
   // Field to store the reporting period (e.g., "Monthly", "Quarterly").

   public KPI() {} 
   // Default no-argument constructor required by JPA.

   public Long getKPIID() { 
       return KPIID; 
   } 
   // Getter method for KPIID.

   public void setKPIID(Long kPIID) { 
       KPIID = kPIID; 
   } 
   // Setter method for KPIID.

   public String getName() { 
       return name; 
   } 
   // Getter method for name.

   public void setName(String name) { 
       this.name = name; 
   } 
   // Setter method for name.

   public String getDefinition() { 
       return definition; 
   } 
   // Getter method for definition.

   public void setDefinition(String definition) { 
       this.definition = definition; 
   } 
   // Setter method for definition.

   public Double getTarget() { 
       return target; 
   } 
   // Getter method for target.

   public void setTarget(Double target) { 
       this.target = target; 
   } 
   // Setter method for target.

   public Double getCurrentValue() { 
       return currentValue; 
   } 
   // Getter method for currentValue.

   public void setCurrentValue(Double currentValue) { 
       this.currentValue = currentValue; 
   } 
   // Setter method for currentValue.

   public String getReportingPeriod() { 
       return reportingPeriod; 
   } 
   // Getter method for reportingPeriod.

   public void setReportingPeriod(String reportingPeriod) { 
       this.reportingPeriod = reportingPeriod; 
   } 
   // Setter method for reportingPeriod.
} 
// End of the KPI entity class.
