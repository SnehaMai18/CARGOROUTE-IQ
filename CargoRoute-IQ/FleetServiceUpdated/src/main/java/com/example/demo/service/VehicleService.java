package com.example.demo.service;

import com.example.demo.dto.VehicleDTO;
import com.example.demo.dto.VehicleAvailabilityDTO;

import java.util.List;

public interface VehicleService {
    VehicleDTO createVehicle(VehicleDTO vehicleDTO);
    VehicleDTO updateVehicle(Long id, VehicleDTO vehicleDTO);
    VehicleDTO getVehicleById(Long id);   // ✅ now returns VehicleDTO
    List<VehicleDTO> getAllVehicles();
    void deleteVehicle(Long id);
    List<VehicleAvailabilityDTO> getVehicleAvailabilities(Long vehicleId);
}