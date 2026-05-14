package com.example.demo.service;
import com.example.demo.dto.DriverDTO;
import com.example.demo.entities.enums.DriverStatus;

import java.util.List;

public interface DriverService {

    // Create a new driver
    DriverDTO insert(DriverDTO driverDTO);

    // Get driver by ID
    DriverDTO fetchByID(Long driverID);

    // Get drivers by status
    List<DriverDTO> fetchByStatus(DriverStatus status);

    // Get all drivers
    List<DriverDTO> fetchAll();

    //Update method
    DriverDTO updateDriver(Long driverID, DriverDTO driverDTO);

    // Delete driver by ID
    void delete(Long driverID);
}