package com.example.demo.service;
import java.util.List;


import com.example.demo.entity.VehicleAvailability;

public interface VehicleAvailabilityService {
    VehicleAvailability save(VehicleAvailability availability);
    List<VehicleAvailability> getAll();
    VehicleAvailability getById(Long id);
    VehicleAvailability update(Long id, VehicleAvailability availability);
    void delete(Long id);
    List<VehicleAvailability> getByVehicleId(Long vehicleId);

}