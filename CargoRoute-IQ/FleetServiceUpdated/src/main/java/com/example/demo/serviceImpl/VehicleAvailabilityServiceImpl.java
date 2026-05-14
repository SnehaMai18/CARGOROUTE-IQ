package com.example.demo.serviceImpl;

import com.example.demo.entity.Vehicle;
import com.example.demo.entity.VehicleAvailability;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.VehicleAvailabilityRepository;
import com.example.demo.repository.VehicleRepository;
import com.example.demo.service.VehicleAvailabilityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class VehicleAvailabilityServiceImpl implements VehicleAvailabilityService {

    @Autowired
    private VehicleAvailabilityRepository repo;

    @Autowired
    private VehicleRepository vehicleRepo; // ✅ needed to fetch vehicle

    @Override
    public VehicleAvailability save(VehicleAvailability availability) {
        // Ensure vehicle exists and set back-reference
        Long vehicleId = availability.getVehicle().getVehicleID();
        Vehicle vehicle = vehicleRepo.findById(vehicleId)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with id: " + vehicleId));
     // ✅ Business rule: endTime must be after startTime
        if (availability.getEndTime() != null && availability.getStartTime() != null &&
            availability.getEndTime().isBefore(availability.getStartTime())) {
            throw new IllegalArgumentException("End time must be after start time");
        }
        availability.setVehicle(vehicle);
        return repo.save(availability);
    }

    @Override
    public List<VehicleAvailability> getAll() {
        return repo.findAll();
    }

    @Override
    public VehicleAvailability getById(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("VehicleAvailability not found with id: " + id));
    }

    @Override
    public VehicleAvailability update(Long id, VehicleAvailability availability) {
        VehicleAvailability existing = getById(id);

        // Ensure vehicle exists and set back-reference
        Long vehicleId = availability.getVehicle().getVehicleID();
        Vehicle vehicle = vehicleRepo.findById(vehicleId)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with id: " + vehicleId));
        // ✅ Business rule check again
        if (availability.getEndTime() != null && availability.getStartTime() != null &&
            availability.getEndTime().isBefore(availability.getStartTime())) {
            throw new IllegalArgumentException("End time must be after start time");
        }
        existing.setVehicle(vehicle);
        existing.setDate(availability.getDate());
        existing.setStartTime(availability.getStartTime());
        existing.setEndTime(availability.getEndTime());
        existing.setReasonNote(availability.getReasonNote());
        existing.setStatus(availability.getStatus());

        return repo.save(existing);
    }

    @Override
    public void delete(Long id) {
        VehicleAvailability existing = getById(id);
        repo.delete(existing);
    }
    @Override
    public List<VehicleAvailability> getByVehicleId(Long vehicleId) {
        // ✅ FIX: use VehicleAvailabilityRepository, not VehicleRepository
        return repo.findByVehicle_VehicleID(vehicleId);
    }


}