package com.example.demo.service;

import java.util.List;

import com.example.demo.dto.ClaimDTO;
import com.example.demo.entity.enums.ClaimStatus;

public interface ClaimService {
    public ClaimDTO createClaim(ClaimDTO dto);
    public List<ClaimDTO> getAllClaims();
    public ClaimDTO getClaimById(Long id);
    public ClaimDTO updateClaimStatus(Long id, ClaimStatus status);
    public List<ClaimDTO> getClaimByExceptionId(Long exceptionID);
    public List<ClaimDTO> getClaimByStatus(ClaimStatus status);
}
