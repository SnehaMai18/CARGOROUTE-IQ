package com.example.demo.repository;



import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.demo.entity.VehicleAvailability;

public interface VehicleAvailabilityRepository extends JpaRepository<VehicleAvailability, Long> {
	 List<VehicleAvailability> findByVehicle_VehicleID(Long vehicleId);

}

