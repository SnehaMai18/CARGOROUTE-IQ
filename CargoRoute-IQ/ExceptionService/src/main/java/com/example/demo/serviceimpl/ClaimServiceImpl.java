package com.example.demo.serviceimpl;

import java.util.List;
import com.example.demo.exception.BadRequestException;
import com.example.demo.entity.enums.ClaimStatus;

import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.dto.ClaimDTO;
import com.example.demo.dto.RequiredResponseDTO;
import com.example.demo.entity.Claim;
import com.example.demo.entity.ExceptionRecord;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.ClaimRepository;
import com.example.demo.repository.ExceptionRepository;
import com.example.demo.clients.NotificationClient;
import com.example.demo.service.ClaimService;
import com.example.demo.service.ExceptionService;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.Authentication;
import com.example.demo.security.JwtUtil;

@Service // Marks this class as a Spring-managed service component
public class ClaimServiceImpl implements ClaimService {

    @Autowired
    private ClaimRepository repo; // Injects the ClaimRepository to access database operations

    @Autowired
    private ExceptionRepository exceptionRepo;

    @Autowired
    private ExceptionService exceptionService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private NotificationClient notificationClient;

    // Save a new Claim or update an existing one
    public ClaimDTO createClaim(ClaimDTO dto){
        if (dto == null) {
            throw new BadRequestException("Claim request body must not be null");
        }
        if (dto.getExceptionID() == null) {
            throw new BadRequestException("Exception ID is required");
        }
        if (dto.getAmountClaimed() == null || dto.getAmountClaimed() <= 0) {
            throw new BadRequestException("Amount claimed must be a positive number");
        }
        if (dto.getStatus() == null) {
            dto.setStatus(ClaimStatus.OPEN);
        }
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String token = (String) authentication.getCredentials();
        Long userId = jwtUtil.extractUserId(token);

        Claim claim = convertToEntity(dto);
        // Ensure ownership is set from authenticated context — ignore frontend-provided ownership
        claim.setFiledBy(userId);
        Claim saved = repo.save(claim);

        String message = String.format(
            "Claim #%d filed against Exception #%d for amount %.2f. Status: %s.",
            saved.getClaimID(),
            saved.getExceptionRecord() != null ? saved.getExceptionRecord().getExceptionID() : 0L,
            saved.getAmountClaimed() != null ? saved.getAmountClaimed() : 0.0,
            saved.getStatus() != null ? saved.getStatus().name() : "N/A"
        );
        notificationClient.notifyUser(userId, saved.getClaimID(), message, "Exception");

        return convertToDTO(saved);
    }

    // Retrieve all claims from the database
    public List<ClaimDTO> getAllClaims(){
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String token = (String) authentication.getCredentials();
        Long userId = jwtUtil.extractUserId(token);
        String role = jwtUtil.extractRole(token);

        if ("Admin".equalsIgnoreCase(role) || "Dispatcher".equalsIgnoreCase(role) || "FleetManager".equalsIgnoreCase(role) || "WarehouseManager".equalsIgnoreCase(role)
            || "Warehouse_Manager".equalsIgnoreCase(role) || "BillingClerk".equalsIgnoreCase(role) || "BILLINGCLERK".equalsIgnoreCase(role) || "BILLING_CLERK".equalsIgnoreCase(role)
            || "Analyst".equalsIgnoreCase(role)) {
            return repo.findAll().stream().map(this::convertToDTO).collect(Collectors.toList());
        } else {
            return repo.findByFiledBy(userId).stream().map(this::convertToDTO).collect(Collectors.toList());
        }
    }

    // Retrieve a claim by its ID with exception details
    public ClaimDTO getClaimById(Long id){
        Claim claim = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Claim with ID " + id + " not found"));
        return convertToDTO(claim);
    }

  
    // Update only the status of an existing claim
    public ClaimDTO updateClaimStatus(Long id, ClaimStatus status) {
        Claim claim = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Claim with ID " + id + " not found"));
        claim.setStatus(status);
        Claim updated = repo.save(claim);

        if (updated.getFiledBy() != null) {
            String message = String.format(
                "Claim #%d status updated to %s for Exception #%d.",
                updated.getClaimID(), status.name(),
                updated.getExceptionRecord() != null ? updated.getExceptionRecord().getExceptionID() : 0L
            );
            notificationClient.notifyUser(updated.getFiledBy(), updated.getClaimID(), message, "Exception");
        }

        return convertToDTO(updated);
    }

    // Retrieve claims by exception ID with exception details
    public List<ClaimDTO> getClaimByExceptionId(Long exceptionID) {
        return repo.findByExceptionRecord_ExceptionID(exceptionID).stream()
                .map(this::convertToDTO).collect(Collectors.toList());
    }

    // Retrieve claims by status
    public List<ClaimDTO> getClaimByStatus(ClaimStatus status) {
        return repo.findByStatus(status).stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    // Convert Entity to DTO with exception details
    private ClaimDTO convertToDTO(Claim claim) {
        ClaimDTO dto = new ClaimDTO();
        dto.setClaimID(claim.getClaimID());
        dto.setFiledBy(claim.getFiledBy());
        dto.setFiledAt(claim.getFiledAt());
        dto.setAmountClaimed(claim.getAmountClaimed());
        dto.setResolutionNotes(claim.getResolutionNotes());
        dto.setStatus(claim.getStatus());
        
        if (claim.getExceptionRecord() != null) {
            dto.setExceptionID(claim.getExceptionRecord().getExceptionID());
            // Fetch full exception details including booking
            try {
                RequiredResponseDTO exceptionDTO = exceptionService.getExceptionById(claim.getExceptionRecord().getExceptionID());
                dto.setException(exceptionDTO);
            } catch (Exception e) {
                System.err.println("Could not fetch exception details for exception ID: " + claim.getExceptionRecord().getExceptionID());
            }
        }
        
        return dto;
    }

    // Convert DTO to Entity
    private Claim convertToEntity(ClaimDTO dto) {
        Claim claim = new Claim();
        claim.setClaimID(dto.getClaimID());
        // filedBy is set server-side from authenticated user — ignore any client-provided value
        claim.setFiledAt(dto.getFiledAt());
        claim.setAmountClaimed(dto.getAmountClaimed());
        claim.setResolutionNotes(dto.getResolutionNotes());
        claim.setStatus(dto.getStatus());
        
        // Fetch and set the exception record
        if (dto.getExceptionID() != null) {
            ExceptionRecord exception = exceptionRepo.findById(dto.getExceptionID())
                    .orElseThrow(() -> new ResourceNotFoundException("Exception with ID " + dto.getExceptionID() + " not found"));
            claim.setExceptionRecord(exception);
        }
        
        return claim;
    }


}