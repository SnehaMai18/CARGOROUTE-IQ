package com.example.demo.service;

import java.util.List;
import com.example.demo.dto.RouteDTO;

public interface RouteService {
    RouteDTO getRouteById(Long id);
    List<RouteDTO> getAllRoutes();
    RouteDTO createRoute(RouteDTO routeDTO);
    RouteDTO updateRoute(Long id, RouteDTO routeDTO);
    void deleteRoute(Long id);

    List<RouteDTO> getRoutesByVehicleId(Long vehicleId);
    List<RouteDTO> getRoutesByLoadId(Long loadId);
}