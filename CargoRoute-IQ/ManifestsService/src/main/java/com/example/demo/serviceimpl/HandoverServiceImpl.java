package com.example.demo.serviceimpl;

import java.util.ArrayList;

import java.util.List;
 
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.stereotype.Service;

import org.springframework.web.client.RestTemplate;

import com.example.demo.clients.NotificationClient;
import com.example.demo.clients.RoleResolverClient;
import com.example.demo.clients.TaskClient;
import com.example.demo.dto.HandoverDTO;

import com.example.demo.dto.HandoverResponseDTO;

import com.example.demo.dto.ManifestRequiredResponseDTO;

import com.example.demo.entities.Handover;

import com.example.demo.entities.Manifest;

import com.example.demo.exception.BadRequestException;

import com.example.demo.exception.ResourceNotFoundException;

import com.example.demo.repository.HandoverRepository;

import com.example.demo.service.HandoverService;
 
@Service

public class HandoverServiceImpl implements HandoverService {
 
    @Autowired

    private HandoverRepository handoverRepository;
 
    @Autowired

    private RestTemplate restTemplate;
    
    
    @Autowired
    private NotificationClient notificationClient;

    @Autowired
    private TaskClient taskClient;

    @Autowired
    private RoleResolverClient roleResolverClient;
 
    private static final String MANIFEST_SERVICE_URL =

            "http://MANIFEST-SERVICE/cargoRoute/manifests/getByManifestId/";
 
    // ================= ENTITY → DTO =================

    private HandoverDTO convertToDTO(Handover entity) {
 
        HandoverDTO dto = new HandoverDTO();

        dto.setHandoverID(entity.getHandoverID());

        dto.setManifestID(entity.getManifest().getManifestID());

        dto.setHandedBy(entity.getHandedBy());

        dto.setHandedAt(entity.getHandedAt());

        dto.setReceivedBy(entity.getReceivedBy());

        dto.setReceivedAt(entity.getReceivedAt());

        dto.setNotes(entity.getNotes());
 
        return dto;

    }
 
    // ================= DTO → ENTITY =================

    private Handover convertToEntity(HandoverDTO dto) {
 
        if (dto == null || dto.getManifestID() == null) {

            throw new BadRequestException("Manifest ID is required");

        }
 
        Manifest manifest = new Manifest();

        manifest.setManifestID(dto.getManifestID());
 
        Handover entity = new Handover();

        entity.setManifest(manifest);

        entity.setHandedBy(dto.getHandedBy());

        entity.setReceivedBy(dto.getReceivedBy());

        entity.setNotes(dto.getNotes());
 
        return entity;

    }
 
    // ================= MANIFEST CALL =================

    private ManifestRequiredResponseDTO callManifestService(Long manifestId) {

        return restTemplate.getForObject(

                MANIFEST_SERVICE_URL + manifestId,

                ManifestRequiredResponseDTO.class);

    }
 
    //================= FIXED RESPONSE BUILDER =================

    private HandoverResponseDTO buildResponse(Handover handover) {
 
        HandoverResponseDTO response = new HandoverResponseDTO();

        response.setHandover(convertToDTO(handover));
 
        try {

            ManifestRequiredResponseDTO manifestDetails =

                    callManifestService(

                            handover.getManifest().getManifestID());

            response.setManifestDetails(manifestDetails);

        } catch (Exception ex) {

            response.setManifestDetails(null);

        }
 
        return response;

    }
 
    // ================= CREATE =================

    @Override

    public HandoverDTO create(HandoverDTO handoverDTO) {
    	
    	

Handover saved =
            handoverRepository.save(convertToEntity(handoverDTO));

    Long dispatcherUserId =
            roleResolverClient.getUserByRole("Dispatcher");
    Long adminId =
            roleResolverClient.getUserByRole("Admin");

notificationClient.notifyUser(
        dispatcherUserId,
        saved.getHandoverID(),
        "Handover completed for manifest " +
            saved.getManifest().getManifestID(),
        "Delivery"
    );


notificationClient.notifyUser(
        adminId,
        saved.getHandoverID(),
        "Handover completed for manifest " +
            saved.getManifest().getManifestID(),
        "Delivery"
    );



        return convertToDTO(saved);

    }
 
    // ================= FETCH BY ID =================

    @Override

    public HandoverResponseDTO getById(Long handoverID) {
 
        Handover handover = handoverRepository.findById(handoverID)

                .orElseThrow(() -> new ResourceNotFoundException("Handover not found with ID: " + handoverID));

        return buildResponse(handover);

    }
 
    // ================= FETCH ALL =================

    @Override

    public List<HandoverResponseDTO> getAll() {
 
        List<HandoverResponseDTO> responses = new ArrayList<>();

        for (Handover handover : handoverRepository.findAll()) {

            responses.add(buildResponse(handover));

        }

        return responses;

    }
 
    // ================= FETCH BY MANIFEST ID =================

    @Override

    public List<HandoverResponseDTO> getByManifestID(Long manifestID) {
 
        List<Handover> handovers =

                handoverRepository.findByManifest_ManifestID(manifestID);
 
        if (handovers.isEmpty()) {

            throw new ResourceNotFoundException(

                    "Handover not found for Manifest ID: " + manifestID);

        }
 
        List<HandoverResponseDTO> responses = new ArrayList<>();

        for (Handover handover : handovers) {

            responses.add(buildResponse(handover));

        }

        return responses;

    }
 
    // ================= FETCH BY HANDED BY =================

    @Override

    public List<HandoverResponseDTO> getByHandedBy(String handedBy) {
 
        List<Handover> handovers =

                handoverRepository.findByHandedBy(handedBy);
 
        if (handovers.isEmpty()) {

            throw new ResourceNotFoundException(

                    "Handover not found for handedBy: " + handedBy

            );

        }
 
        List<HandoverResponseDTO> responses = new ArrayList<>();

        for (Handover handover : handovers) {

            responses.add(buildResponse(handover));

        }

        return responses;

    }
 
    // ================= UPDATE =================

    @Override

    public HandoverDTO update(Long handoverID, HandoverDTO handoverDTO) {
 
        Handover existing = handoverRepository.findById(handoverID)

                .orElseThrow(() -> new ResourceNotFoundException("Handover not found with ID: " + handoverID));
 
        if (handoverDTO.getHandedBy() != null)

            existing.setHandedBy(handoverDTO.getHandedBy());
 
        if (handoverDTO.getReceivedBy() != null)

            existing.setReceivedBy(handoverDTO.getReceivedBy());
 
        if (handoverDTO.getNotes() != null)

            existing.setNotes(handoverDTO.getNotes());
 
        return convertToDTO(

                handoverRepository.save(existing));

    }
 
    // ================= DELETE =================

    @Override

    public void delete(Long handoverID) {

        Handover handover = handoverRepository.findById(handoverID)

                .orElseThrow(() -> new ResourceNotFoundException("Handover not found with ID: " + handoverID));
 
        handoverRepository.delete(handover);

    }

}
 