package com.example.demo.dto;


public class ManifestRequiredResponseDTO {

    private ManifestDTO manifest;
    private LoadDTO load;
    private VehicleDTO vehicle;
    
	public ManifestDTO getManifest() {
		return manifest;
	}
	public void setManifest(ManifestDTO manifest) {
		this.manifest = manifest;
	}
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
