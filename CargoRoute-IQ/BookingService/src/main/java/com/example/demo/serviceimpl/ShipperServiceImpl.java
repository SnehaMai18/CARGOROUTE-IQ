package com.example.demo.serviceimpl;

import java.util.List;
import com.example.demo.exception.BadRequestException;
import com.example.demo.exception.ResourceNotFoundException;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.dto.ShipperDTO;
import com.example.demo.entity.Shipper;
import com.example.demo.entity.enums.ShipperStatus;
import com.example.demo.repository.ShipperRepository;
import com.example.demo.service.ShipperService;

@Service
public class ShipperServiceImpl implements ShipperService  {

    @Autowired
    private ShipperRepository repo;

    public ShipperDTO createShipper(ShipperDTO s){
        if (s == null || s.getName() == null || s.getName().trim().isEmpty()) {
            throw new BadRequestException("Shipper name is required");
        }
        Shipper shipper = convertToEntity(s);
        Shipper saved = repo.save(shipper);
        return convertToDTO(saved);
    }

    public List<ShipperDTO> getAllShippers(){
        return repo.findAll().stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    public ShipperDTO getShipperById(Long id) {
        Shipper shipper = repo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Shipper with ID " + id + " not found"));
        return convertToDTO(shipper);
    }

    public List<ShipperDTO> getByShipperStatus(ShipperStatus status) {
        return repo.findByStatus(status).stream().map(this::convertToDTO).collect(Collectors.toList());
    }

   

    private Shipper convertToEntity(ShipperDTO dto) {
        Shipper shipper = new Shipper();
        shipper.setShipperID(dto.getShipperID());
        shipper.setName(dto.getName());
        shipper.setContactInfo(dto.getContactInfo());
        shipper.setAccountTerms(dto.getAccountTerms());
        shipper.setStatus(dto.getStatus());
        return shipper;
    }

    private ShipperDTO convertToDTO(Shipper shipper) {
        ShipperDTO dto = new ShipperDTO();
        dto.setShipperID(shipper.getShipperID());
        dto.setName(shipper.getName());
        dto.setContactInfo(shipper.getContactInfo());
        dto.setAccountTerms(shipper.getAccountTerms());
        dto.setStatus(shipper.getStatus());
        return dto;
    }
}
