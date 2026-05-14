package com.example.demo.dto;


public class DispatchResponseDTO {

    private DispatchDTO dispatch;
    private LoadDTO load;
    private VehicleDTO vehicle; 
    
	public DispatchDTO getDispatch() {
		return dispatch;
	}
	public void setDispatch(DispatchDTO dispatch) {
		this.dispatch = dispatch;
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
    