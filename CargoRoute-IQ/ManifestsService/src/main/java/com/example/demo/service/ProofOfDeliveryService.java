package com.example.demo.service;
import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import com.example.demo.dto.ProofOfDeliveryDTO;
import com.example.demo.dto.ProofOfDeliveryResponseDTO;
import com.example.demo.entities.enums.PodType;
import com.example.demo.entities.enums.ProofOfDeliveryStatus;

public interface ProofOfDeliveryService {

    ProofOfDeliveryDTO create(ProofOfDeliveryDTO dto, MultipartFile file);

    ProofOfDeliveryResponseDTO getById(Long podID);

    List<ProofOfDeliveryResponseDTO> getAll();

    ProofOfDeliveryResponseDTO getByBookingID(Long bookingID);

    List<ProofOfDeliveryResponseDTO> getByPodType(PodType podType);

    List<ProofOfDeliveryResponseDTO> getByProofOfDeliveryStatus(ProofOfDeliveryStatus status);

    List<ProofOfDeliveryResponseDTO> getByDriverId(Long driverId);

    ProofOfDeliveryDTO update(Long podID, ProofOfDeliveryDTO proofOfDeliveryDTO);

    void delete(Long podID);
}
