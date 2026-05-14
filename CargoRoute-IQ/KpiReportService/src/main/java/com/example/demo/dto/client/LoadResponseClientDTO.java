package com.example.demo.dto.client;

/**
 * Mirrors RoutingService's RequiredResponseDTO — wraps vehicle + load together.
 * Used when deserializing GET /loads response from ROUTING-SERVICE.
 */
public class LoadResponseClientDTO {

    private VehicleClientDTO vehicle;
    private LoadClientDTO loadDto;

    public LoadResponseClientDTO() {}

    public VehicleClientDTO getVehicle() { return vehicle; }
    public void setVehicle(VehicleClientDTO vehicle) { this.vehicle = vehicle; }

    public LoadClientDTO getLoadDto() { return loadDto; }
    public void setLoadDto(LoadClientDTO loadDto) { this.loadDto = loadDto; }
}
