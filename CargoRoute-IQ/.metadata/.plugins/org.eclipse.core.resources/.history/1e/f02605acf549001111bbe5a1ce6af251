package com.example.demo.service;

import com.example.demo.dto.DispatchDTO;
import com.example.demo.dto.DriverAckDTO;
import com.example.demo.dto.DriverAckResponseDTO;
import com.example.demo.dto.DriverDTO;

import java.util.List;

public interface DriverAckService {
	DriverAckDTO insert(DriverAckDTO driverAckDTO);

    public DriverAckResponseDTO fetchByID(Long ackID);

    public List<DriverAckResponseDTO> fetchByDispatchID(Long dispatchID);

    public List<DriverAckResponseDTO> fetchByDriverID(Long driverID);

    public List<DriverAckResponseDTO> fetchAll();

    //detailed fetch
    public List<DriverAckResponseDTO> fetchAllWithDetails();

    public DriverAckDTO updateDriverAck(Long ackID, DriverAckDTO driverAckDTO);

    public void delete(Long ackID);
}
