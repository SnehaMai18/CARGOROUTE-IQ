package com.example.demo.service;
import java.util.List;
import com.example.demo.dto.HandoverDTO;
import com.example.demo.dto.HandoverResponseDTO;

public interface HandoverService {

    HandoverDTO create(HandoverDTO handoverDTO);

    HandoverResponseDTO getById(Long handoverID);

    List<HandoverResponseDTO> getAll();

    List<HandoverResponseDTO> getByManifestID(Long manifestID);

    List<HandoverResponseDTO> getByHandedBy(String handedBy);  

    HandoverDTO update(Long handoverID, HandoverDTO handoverDTO);

    void delete(Long handoverID);
}