package com.example.demo.entity;
// Declares the package where this class resides, grouping it under 'entities'.

import jakarta.persistence.*; 

// Imports JPA annotations and persistence classes from Jakarta Persistence API.

import java.time.LocalDateTime;
// Imports LocalDateTime for timestamp fields (date + time).

import com.example.demo.enums.ReportScope; 
// Imports the custom enum 'ReportScope' from your project, used to define the scope of the report.

@Entity 
// Marks this class as a JPA entity, mapping it to a database table.

public class Report { 
// Declares the public class 'Report' representing a report record in the database.

    @Id 
    // Specifies the primary key field of the entity.

    @GeneratedValue(strategy = GenerationType.IDENTITY) 
    // Configures auto-generation of the primary key using the database identity column.

    private Long reportID; 
    // Field for the unique identifier of each report.

    @Enumerated(EnumType.STRING)
    // Specifies that the enum 'scope' should be stored as a string in the database.

    private ReportScope scope;
    // Field to store the scope of the report (e.g., DAILY, MONTHLY, GLOBAL).

    @Column(columnDefinition = "TEXT") 
    // Specifies that the column should be stored as TEXT in the database (for large JSON strings).

    private String parametersJSON; 
    // Field to store report parameters in JSON format.

    @Column(columnDefinition = "TEXT") 
    // Specifies that the column should be stored as TEXT in the database (for large JSON strings).

    private String metricsJSON; 
    // Field to store report metrics in JSON format.

    private String generatedBy; 
    // Field to store the identifier (e.g., username) of the person/system that generated the report.

    private LocalDateTime generatedAt; 
    // Field to store the timestamp when the report was generated.

    public Report() {} 
    // Default no-argument constructor required by JPA.

    public Long getReportID() { 
        return reportID; 
    } 
    // Getter method for reportID.

    public void setReportID(Long reportID) { 
        this.reportID = reportID; 
    } 
    // Setter method for reportID.

    public ReportScope getScope() { 
        return scope; 
    } 
    // Getter method for scope.

    public void setScope(ReportScope scope) { 
        this.scope = scope; 
    } 
    // Setter method for scope.

    public String getParametersJSON() { 
        return parametersJSON; 
    } 
    // Getter method for parametersJSON.

    public void setParametersJSON(String parametersJSON) { 
        this.parametersJSON = parametersJSON; 
    } 
    // Setter method for parametersJSON.

    public String getMetricsJSON() { 
        return metricsJSON; 
    } 
    // Getter method for metricsJSON.

    public void setMetricsJSON(String metricsJSON) { 
        this.metricsJSON = metricsJSON; 
    } 
    // Setter method for metricsJSON.

    public String getGeneratedBy() { 
        return generatedBy; 
    } 
    // Getter method for generatedBy.

    public void setGeneratedBy(String generatedBy) { 
        this.generatedBy = generatedBy; 
    } 
    // Setter method for generatedBy.

    public LocalDateTime getGeneratedAt() { 
        return generatedAt; 
    } 
    // Getter method for generatedAt.

    public void setGeneratedAt(LocalDateTime generatedAt) { 
        this.generatedAt = generatedAt; 
    } 
    // Setter method for generatedAt.
} 
// End of the Report entity class.
