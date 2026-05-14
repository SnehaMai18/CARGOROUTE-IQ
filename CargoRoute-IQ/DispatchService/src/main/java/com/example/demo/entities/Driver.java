package com.example.demo.entities;
import com.example.demo.entities.enums.DriverStatus;
import jakarta.persistence.*; 

@Entity 
public class Driver { 
 
    @Id 		// Primary key
    @GeneratedValue(strategy = GenerationType.IDENTITY) 	// Auto-increment ID
    private Long driverID; 	// Unique identifier for the driver record
 
    private String name; 
 
    private String licenseNo; 
 
    private String contactInfo; 
 
    private String mobileNumber; 
 
    @Enumerated(EnumType.STRING)
    private DriverStatus status; 
 
    public Driver(){} 	// Default constructor
 
    
    // Parameterized constructor to initialize all fields
    public Driver(Long driverID, String name, String licenseNo, String contactInfo, String mobileNumber,
    		DriverStatus status) {
		super();
		this.driverID = driverID;
		this.name = name;
		this.licenseNo = licenseNo;
		this.contactInfo = contactInfo;
		this.mobileNumber = mobileNumber;
		this.status = status;
	}


  //getters and setters
	public Long getDriverID() { 
        return driverID; 
    } 
 
    public void setDriverID(Long driverID) { 
        this.driverID = driverID; 
    } 
 
    public String getName() { 
        return name; 
    } 
 
    public void setName(String name) { 
        this.name = name; 
    } 
 
    public String getLicenseNo() { 
        return licenseNo; 
    } 
 
    public void setLicenseNo(String licenseNo) { 
        this.licenseNo = licenseNo; 
    } 
 
    public String getContactInfo() { 
        return contactInfo; 
    } 
 
    public void setContactInfo(String contactInfo) { 
        this.contactInfo = contactInfo; 
    } 
 
    public String getMobileNumber() { 
        return mobileNumber; 
    } 
 
    public void setMobileNumber(String mobileNumber) { 
        this.mobileNumber = mobileNumber; 
    } 
 
    public DriverStatus getStatus() { 
        return status; 
    } 
 
    public void setStatus(DriverStatus status) { 
        this.status = status; 
    } 
}