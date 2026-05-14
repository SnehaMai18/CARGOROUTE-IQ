package com.example.demo.serviceImpl;
 
import java.util.List;
 
import java.util.stream.Collectors;
 
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.core.ParameterizedTypeReference;

import org.springframework.http.HttpMethod;

import org.springframework.stereotype.Service;

import org.springframework.web.client.RestTemplate;
 
import com.example.demo.clients.NotificationClient;

import com.example.demo.clients.TaskClient;

import com.example.demo.dto.DriverDTO;

import com.example.demo.dto.VehicleAvailabilityDTO;

import com.example.demo.dto.VehicleDTO;

import com.example.demo.entity.Vehicle;

import com.example.demo.entity.VehicleAvailability;

import com.example.demo.exception.ResourceNotFoundException;

import com.example.demo.repository.VehicleRepository;

import com.example.demo.service.VehicleService;
 
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
 
@Service

public class VehicleServiceImpl implements VehicleService {
 
    @Autowired

    private VehicleRepository vehicleRepository;
 
    @Autowired

    private RestTemplate restTemplate;
 
    @Autowired

    private NotificationClient notificationClient;
 
    @Autowired

    private TaskClient taskClient;
 
    // Mapping methods

    private VehicleDTO entityToDto(Vehicle vehicle) {

        VehicleDTO dto = new VehicleDTO();

        dto.setVehicleID(vehicle.getVehicleID());

        dto.setRegNumber(vehicle.getRegNumber());

        dto.setType(vehicle.getType());

        dto.setMaxWeightKg(vehicle.getMaxWeightKg());

        dto.setMaxVolumeM3(vehicle.getMaxVolumeM3());

        dto.setStatus(vehicle.getStatus());

        dto.setLastMaintenanceAt(vehicle.getLastMaintenanceAt());
 
        // ✅ Include driverID in DTO

        dto.setDriverID(vehicle.getDriverID());

        // ✅ Enrich driver (DispatchService runs on port 7001 at /drivers/{id})

        if (vehicle.getDriverID() != null) {

            	 String driverServiceUrl = "http://DISPATCH-SERVICE/cargoRoute/drivers/getDriverByDriverId/" + vehicle.getDriverID();

                DriverDTO driverDTO = restTemplate.getForObject(driverServiceUrl, DriverDTO.class);

                dto.setDriver(driverDTO);

        }
 
        // ✅ Map availabilities (Entity → DTO)

        if (vehicle.getAvailabilities() != null) {

            List<VehicleAvailabilityDTO> availabilityDtos = vehicle.getAvailabilities()

                    .stream()

                    .map(av -> {

                        VehicleAvailabilityDTO dtoAv = new VehicleAvailabilityDTO();

                        dtoAv.setAvailID(av.getAvailID());

                        dtoAv.setDate(av.getDate());

                        dtoAv.setStartTime(av.getStartTime());

                        dtoAv.setEndTime(av.getEndTime());

                        dtoAv.setReasonNote(av.getReasonNote());

                        dtoAv.setStatus(av.getStatus());

                        return dtoAv;

                    })

                    .collect(Collectors.toList());

            dto.setAvailabilities(availabilityDtos);

        }
 
        return dto;

    }
 
    private Vehicle dtoToEntity(VehicleDTO dto) {

        Vehicle vehicle = new Vehicle();

        vehicle.setVehicleID(dto.getVehicleID());

        vehicle.setRegNumber(dto.getRegNumber());

        vehicle.setType(dto.getType());

        vehicle.setMaxWeightKg(dto.getMaxWeightKg());

        vehicle.setMaxVolumeM3(dto.getMaxVolumeM3());

        vehicle.setStatus(dto.getStatus());

        vehicle.setLastMaintenanceAt(dto.getLastMaintenanceAt());
 
        // ✅ Handle both driverID and nested driver object

        if (dto.getDriverID() != null) {

            vehicle.setDriverID(dto.getDriverID());

        } else if (dto.getDriver() != null) {

            vehicle.setDriverID(dto.getDriver().getDriverID());

        }
 
        // ✅ Map availabilities (DTO → Entity)

        if (dto.getAvailabilities() != null) {

            List<VehicleAvailability> availabilityEntities = dto.getAvailabilities()

                    .stream()

                    .map(avDto -> {

                        VehicleAvailability entity = new VehicleAvailability();

                        entity.setAvailID(avDto.getAvailID());

                        entity.setDate(avDto.getDate());

                        entity.setStartTime(avDto.getStartTime());

                        entity.setEndTime(avDto.getEndTime());

                        entity.setReasonNote(avDto.getReasonNote());

                        entity.setStatus(avDto.getStatus());

                        entity.setVehicle(vehicle); // back-reference

                        return entity;

                    })

                    .collect(Collectors.toList());

            vehicle.setAvailabilities(availabilityEntities);

        }
 
        return vehicle;

    }
 
//    @Override

//    public VehicleDTO createVehicle(VehicleDTO vehicleDTO) {

//        Vehicle vehicle = dtoToEntity(vehicleDTO);

//        Vehicle saved = vehicleRepository.save(vehicle);

//

//        if (saved.getDriverID() != null) {

//            notificationClient.notifyUser(

//                    saved.getDriverID(),

//                    saved.getVehicleID(),

//                    "Pickup task available for vehicle " + saved.getRegNumber() + ".",

//                    "Pickup"

//            );

//            

//            taskClient.createTask(

//                saved.getDriverID(),

//                saved.getVehicleID(),

//                "Prepare vehicle " + saved.getRegNumber() + " for pickup operations.",

//                null

//            );

//        }

//

//        return entityToDto(saved);

//    }


    @Override

    public VehicleDTO createVehicle(VehicleDTO vehicleDTO) {

        Vehicle vehicle = dtoToEntity(vehicleDTO);

        vehicleRepository.save(vehicle);

        return entityToDto(vehicle);

    }
 
    @Override

    public VehicleDTO updateVehicle(Long id, VehicleDTO vehicleDTO) {

        Vehicle vehicle = vehicleRepository.findById(id)

                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with id " + id));
 
        Long previousDriverId = vehicle.getDriverID();
 
        // ✅ Update basic fields

        vehicle.setRegNumber(vehicleDTO.getRegNumber());

        vehicle.setType(vehicleDTO.getType());

        vehicle.setMaxWeightKg(vehicleDTO.getMaxWeightKg());

        vehicle.setMaxVolumeM3(vehicleDTO.getMaxVolumeM3());

        vehicle.setStatus(vehicleDTO.getStatus());

        vehicle.setLastMaintenanceAt(vehicleDTO.getLastMaintenanceAt());
 
        // ✅ Update driver

     // ✅ Update driver

        if (vehicleDTO.getDriverID() != null) {

            vehicle.setDriverID(vehicleDTO.getDriverID());

        } else if (vehicleDTO.getDriver() != null) {

            vehicle.setDriverID(vehicleDTO.getDriver().getDriverID());

        }
 
        // ✅ Safe orphan removal handling

        if (vehicleDTO.getAvailabilities() != null) {

            vehicle.getAvailabilities().clear(); // clear existing collection
 
            vehicleDTO.getAvailabilities().forEach(avDto -> {

                VehicleAvailability entity = new VehicleAvailability();

                entity.setAvailID(avDto.getAvailID());

                entity.setDate(avDto.getDate());

                entity.setStartTime(avDto.getStartTime());

                entity.setEndTime(avDto.getEndTime());

                entity.setReasonNote(avDto.getReasonNote());

                entity.setStatus(avDto.getStatus());

                entity.setVehicle(vehicle); // back-reference

                vehicle.getAvailabilities().add(entity);

            });

        }
 
        Vehicle updated = vehicleRepository.save(vehicle);
 
        if (updated.getDriverID() != null && !updated.getDriverID().equals(previousDriverId)) {

            notificationClient.notifyUser(

                    updated.getDriverID(),

                    updated.getVehicleID(),

                    "Vehicle " + updated.getRegNumber() + " has been reassigned to you.",

                "Delivery"

            );

            // WHY: reassignment must transfer task ownership to the newly assigned driver.

            taskClient.createTask(

                updated.getDriverID(),

                updated.getVehicleID(),

                "Acknowledge reassignment for vehicle " + updated.getRegNumber() + ".",

                null

            );

        }
 
        return entityToDto(updated);

    }
 
    @Override

    public List<VehicleDTO> getAllVehicles() {

        return vehicleRepository.findAll().stream()

                .map(this::entityToDto)

                .collect(Collectors.toList());

    }
 
    @Override

    public void deleteVehicle(Long id) {

        Vehicle vehicle = vehicleRepository.findById(id)

                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with id " + id));

        if (vehicle.getDriverID() != null) {

            notificationClient.notifyUser(

                    vehicle.getDriverID(),

                    vehicle.getVehicleID(),

                    "Vehicle " + vehicle.getRegNumber() + " is no longer available.",

                    "Exception"

            );

            // WHY: unavailability events need an exception task so replacement actions are tracked.

            taskClient.createTask(

                vehicle.getDriverID(),

                vehicle.getVehicleID(),

                "Handle unavailability exception for vehicle " + vehicle.getRegNumber() + ".",

                null

            );

        }

        vehicleRepository.delete(vehicle);

    }
 
    @Override

    @CircuitBreaker(name = "driverService", fallbackMethod = "driverFallback")

    public VehicleDTO getVehicleById(Long id) {

        Vehicle vehicle = vehicleRepository.findById(id)

                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with id " + id));
 
        return entityToDto(vehicle); // ✅ enriched VehicleDTO

    }
 
    @Override

    @CircuitBreaker(name = "fleetService", fallbackMethod = "fleetFallback")

    public List<VehicleAvailabilityDTO> getVehicleAvailabilities(Long vehicleId) {

        return restTemplate.exchange(

        		"http://FLEET-SERVICE/cargoRoute/vehicleAvailability/vehicle/" + vehicleId,

                HttpMethod.GET,

                null,

                new ParameterizedTypeReference<List<VehicleAvailabilityDTO>>() {}

        ).getBody();

    }
 
    // Fallback methods

    public VehicleDTO driverFallback(Long id, Throwable t) {

        Vehicle vehicle = vehicleRepository.findById(id)

                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with id " + id));

        return entityToDto(vehicle); // ✅ return VehicleDTO without driver enrichment

    }
 
    public List<VehicleAvailabilityDTO> fleetFallback(Long vehicleId, Throwable t) {

        return List.of(); // ✅ safe fallback: empty list

    }

}
 