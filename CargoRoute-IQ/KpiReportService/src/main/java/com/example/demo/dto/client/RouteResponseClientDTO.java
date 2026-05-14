package com.example.demo.dto.client;

/**
 * Mirrors RoutingService RouteDTO for deserialization.
 * The load field is nested: { "load": { "loadID": 1, ... }, "distanceKm": 350.0, ... }
 */
public class RouteResponseClientDTO {

    private Long routeID;
    private LoadClientDTO load;
    private Double distanceKm;
    private String status;

    public RouteResponseClientDTO() {}

    public Long getRouteID() { return routeID; }
    public void setRouteID(Long routeID) { this.routeID = routeID; }

    public LoadClientDTO getLoad() { return load; }
    public void setLoad(LoadClientDTO load) { this.load = load; }

    public Double getDistanceKm() { return distanceKm; }
    public void setDistanceKm(Double distanceKm) { this.distanceKm = distanceKm; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
