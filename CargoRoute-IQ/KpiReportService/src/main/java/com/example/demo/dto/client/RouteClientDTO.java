package com.example.demo.dto.client;

/**
 * Mirrors RoutingService RouteDTO — only distanceKm needed for revenue per km.
 */
public class RouteClientDTO {

    private Long routeID;
    private Long loadID;   // extracted from nested load object
    private Double distanceKm;
    private String status;

    public RouteClientDTO() {}

    public Long getRouteID() { return routeID; }
    public void setRouteID(Long routeID) { this.routeID = routeID; }

    public Long getLoadID() { return loadID; }
    public void setLoadID(Long loadID) { this.loadID = loadID; }

    public Double getDistanceKm() { return distanceKm; }
    public void setDistanceKm(Double distanceKm) { this.distanceKm = distanceKm; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
