package com.example.demo.service;

import java.util.List;
import com.example.demo.dto.ShipperDTO;
import com.example.demo.entity.enums.ShipperStatus;

public interface ShipperService {
    ShipperDTO createShipper(ShipperDTO s);
    List<ShipperDTO> getAllShippers();
    ShipperDTO getShipperById(Long id);
    List<ShipperDTO> getByShipperStatus(ShipperStatus status);
   
}