package com.example.demo.dto;

public class LoadResponseDTO {

    private LoadDTO load;
    private VehicleDTO vehicle; // ✅ ADD THIS

    public LoadDTO getLoad() {
        return load;
    }

    public void setLoad(LoadDTO load) {
        this.load = load;
    }

    public VehicleDTO getVehicle() {
        return vehicle;
    }

    public void setVehicle(VehicleDTO vehicle) {
        this.vehicle = vehicle;
    }
}