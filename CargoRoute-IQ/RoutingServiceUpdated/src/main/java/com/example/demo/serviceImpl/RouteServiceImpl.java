package com.example.demo.serviceImpl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.dto.RouteDTO;
import com.example.demo.dto.LoadDTO;
import com.example.demo.entity.Route;
import com.example.demo.entity.Load;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.RouteRepository;
import com.example.demo.repository.LoadRepository;
import com.example.demo.service.RouteService;

@Service
public class RouteServiceImpl implements RouteService {

    @Autowired
    private RouteRepository routeRepository;

    @Autowired
    private LoadRepository loadRepository;

    @Override
    public RouteDTO getRouteById(Long id) {
        Route route = routeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Route not found with id: " + id));
        return entityToDto(route);
    }

    @Override
    public List<RouteDTO> getAllRoutes() {
        return routeRepository.findAll()
                .stream()
                .map(this::entityToDto)
                .collect(Collectors.toList());
    }

    @Override
    public RouteDTO createRoute(RouteDTO routeDTO) {
        Route route = dtoToEntity(routeDTO);
        Route saved = routeRepository.save(route);
        return entityToDto(saved);
    }

    @Override
    public RouteDTO updateRoute(Long id, RouteDTO routeDTO) {
        Route route = routeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Route not found with id: " + id));
        route.setSequenceJSON(routeDTO.getSequenceJSON());
        route.setDistanceKm(routeDTO.getDistanceKm());
        route.setEstimatedDurationMin(routeDTO.getEstimatedDurationMin());
        route.setCostEstimate(routeDTO.getCostEstimate());
        route.setStatus(routeDTO.getStatus());
        Route updated = routeRepository.save(route);
        return entityToDto(updated);
    }

    @Override
    public void deleteRoute(Long id) {
        Route route = routeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Route not found with id: " + id));
        routeRepository.delete(route);
    }

    @Override
    public List<RouteDTO> getRoutesByVehicleId(Long vehicleId) {
        return routeRepository.findAll()
                .stream()
                .filter(r -> r.getLoad().getVehicleID().equals(vehicleId))
                .map(this::entityToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<RouteDTO> getRoutesByLoadId(Long loadId) {
        return routeRepository.findAll()
                .stream()
                .filter(r -> r.getLoad().getLoadID().equals(loadId))
                .map(this::entityToDto)
                .collect(Collectors.toList());
    }
    private void validateRouteDTO(RouteDTO dto) {
        if (dto.getDistanceKm() != null && dto.getDistanceKm() <= 0) {
            throw new IllegalArgumentException("Distance must be greater than zero");
        }
        if (dto.getEstimatedDurationMin() != null && dto.getEstimatedDurationMin() <= 0) {
            throw new IllegalArgumentException("Estimated duration must be greater than zero");
        }
        if (dto.getCostEstimate() != null && dto.getCostEstimate() < 0) {
            throw new IllegalArgumentException("Cost estimate cannot be negative");
        }
        if (dto.getStatus() == null || dto.getStatus().trim().isEmpty()) {
            throw new IllegalArgumentException("Route status is required");
        }
    }

    // Mapping methods
    private RouteDTO entityToDto(Route route) {
        RouteDTO dto = new RouteDTO();
        dto.setRouteID(route.getRouteID());
        dto.setLoad(loadEntityToDto(route.getLoad()));
        dto.setSequenceJSON(route.getSequenceJSON());
        dto.setDistanceKm(route.getDistanceKm());
        dto.setEstimatedDurationMin(route.getEstimatedDurationMin());
        dto.setCostEstimate(route.getCostEstimate());
        dto.setStatus(route.getStatus());
        return dto;
    }

    private Route dtoToEntity(RouteDTO dto) {
        Route route = new Route();
        route.setRouteID(dto.getRouteID());
        Load load = loadRepository.findById(dto.getLoad().getLoadID())
                .orElseThrow(() -> new ResourceNotFoundException("Load not found with id: " + dto.getLoad().getLoadID()));
        route.setLoad(load);
        route.setSequenceJSON(dto.getSequenceJSON());
        route.setDistanceKm(dto.getDistanceKm());
        route.setEstimatedDurationMin(dto.getEstimatedDurationMin());
        route.setCostEstimate(dto.getCostEstimate());
        route.setStatus(dto.getStatus());
        return route;
    }

    private LoadDTO loadEntityToDto(Load load) {
        LoadDTO dto = new LoadDTO();
        dto.setLoadID(load.getLoadID());
        dto.setLoadCode(load.getLoadCode());
        dto.setVehicleID(load.getVehicleID());
        dto.setPlannedStart(load.getPlannedStart());
        dto.setPlannedEnd(load.getPlannedEnd());
        dto.setTotalWeightKg(load.getTotalWeightKg());
        dto.setTotalVolumeM3(load.getTotalVolumeM3());
        dto.setBookingsJSON(load.getBookingsJSON());
        dto.setStatus(load.getStatus());
        return dto;
    }
}