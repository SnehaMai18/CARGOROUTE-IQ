package com.example.demo.serviceimpl;
 
 
import java.util.ArrayList;

import java.util.List;
 
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.stereotype.Service;
 
import com.example.demo.dto.DriverDTO;

import com.example.demo.entities.Driver;

import com.example.demo.entities.enums.DriverStatus;

import com.example.demo.exception.BadRequestException;

import com.example.demo.exception.ResourceNotFoundException;

import com.example.demo.repository.DriverRepository;

import com.example.demo.service.DriverService;
 
@Service

public class DriverServiceImpl implements DriverService {
 
    @Autowired

    private DriverRepository driverRepository;
 
    //Entity to DTO 

    private DriverDTO convertToDto(Driver driver) {

        DriverDTO dto = new DriverDTO();

        dto.setDriverID(driver.getDriverID());

        dto.setName(driver.getName());

        dto.setLicenseNo(driver.getLicenseNo());

        dto.setContactInfo(driver.getContactInfo());

        dto.setMobileNumber(driver.getMobileNumber());

        dto.setStatus(driver.getStatus());

        return dto;

    }
 
    //DTO to ENTITY 

    private Driver convertToEntity(DriverDTO dto) {

        Driver driver = new Driver();

        driver.setName(dto.getName());

        driver.setLicenseNo(dto.getLicenseNo());

        driver.setContactInfo(dto.getContactInfo());

        driver.setMobileNumber(dto.getMobileNumber());

        driver.setStatus(dto.getStatus());

        return driver;

    }
 
    //CREATE 

    @Override

    public DriverDTO insert(DriverDTO driverDTO) {
 
        if (driverDTO == null || driverDTO.getName() == null) {

            throw new BadRequestException("Driver name is required");

        }

        Driver saved = driverRepository.save(convertToEntity(driverDTO));

        return convertToDto(saved);

    }
 
    //GET BY ID 

    @Override

    public DriverDTO fetchByID(Long driverID) {
 
        Driver driver = driverRepository.findById(driverID)

                .orElseThrow(() -> new ResourceNotFoundException("Driver not found with ID: " + driverID));

        return convertToDto(driver);

    }
 
    //GET BY STATUS

    @Override

    public List<DriverDTO> fetchByStatus(DriverStatus status) {
 
        List<Driver> drivers = driverRepository.findByStatus(status);

        List<DriverDTO> dtoList = new ArrayList<>();
 
        for (Driver driver : drivers) {

            dtoList.add(convertToDto(driver));

        }
 
        return dtoList;

    }
 
    //GET ALL 

    @Override

    public List<DriverDTO> fetchAll() {
 
        List<Driver> drivers = driverRepository.findAll();

        List<DriverDTO> dtoList = new ArrayList<>();
 
        for (Driver driver : drivers) {

            dtoList.add(convertToDto(driver));

        }
 
        return dtoList;

    }
 
    //UPDATE 

    @Override

    public DriverDTO updateDriver(Long driverID, DriverDTO driverDTO) {
 
        Driver existing = driverRepository.findById(driverID)

                .orElseThrow(() -> new ResourceNotFoundException("Driver not found with ID: " + driverID));
 
        if (driverDTO.getName() != null)

            existing.setName(driverDTO.getName());
 
        if (driverDTO.getContactInfo() != null)

            existing.setContactInfo(driverDTO.getContactInfo());
 
        if (driverDTO.getMobileNumber() != null)

            existing.setMobileNumber(driverDTO.getMobileNumber());
 
        if (driverDTO.getStatus() != null)

            existing.setStatus(driverDTO.getStatus());
 
        return convertToDto(driverRepository.save(existing));

    }
 
    //DELETE 

    @Override

    public void delete(Long driverID) {
 
        Driver driver = driverRepository.findById(driverID)

                .orElseThrow(() -> new ResourceNotFoundException("Driver not found with ID: " + driverID));

        driverRepository.delete(driver);

    }

}
 