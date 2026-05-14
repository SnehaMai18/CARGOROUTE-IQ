package com.example.demo.serviceimpl;

import com.example.demo.dto.ClaimDTO;
import com.example.demo.dto.ExceptionRecordDTO;
import com.example.demo.dto.RequiredResponseDTO;
import com.example.demo.entity.Claim;
import com.example.demo.entity.ExceptionRecord;
import com.example.demo.entity.enums.ClaimStatus;
import com.example.demo.entity.enums.ExceptionStatus;
import com.example.demo.exception.BadRequestException;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.ClaimRepository;
import com.example.demo.repository.ExceptionRepository;
import com.example.demo.security.JwtUtil;
import com.example.demo.service.ExceptionService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ClaimServiceImplTest {

    @Mock private ClaimRepository      repo;
    @Mock private ExceptionRepository  exceptionRepo;
    @Mock private ExceptionService     exceptionService;
    @Mock private JwtUtil              jwtUtil;

    @InjectMocks
    private ClaimServiceImpl claimService;

    private Claim              claim;
    private ClaimDTO           dto;
    private ExceptionRecord    exceptionRecord;
    private RequiredResponseDTO requiredResponseDTO;

    private static final String DUMMY_TOKEN = "dummy-token";
    private static final Long   TEST_USER_ID = 1L;

    @BeforeEach
    void setUp() {
        exceptionRecord = new ExceptionRecord();
        exceptionRecord.setExceptionID(1L);
        exceptionRecord.setStatus(ExceptionStatus.PENDING);

        claim = new Claim();
        claim.setClaimID(1L);
        claim.setFiledBy(TEST_USER_ID);
        claim.setAmountClaimed(5000.0);
        claim.setStatus(ClaimStatus.OPEN);
        claim.setExceptionRecord(exceptionRecord);

        dto = new ClaimDTO();
        dto.setClaimID(1L);
        dto.setFiledBy(TEST_USER_ID);  // set on client but overridden server-side
        dto.setAmountClaimed(5000.0);
        dto.setStatus(ClaimStatus.OPEN);
        dto.setExceptionID(1L);

        ExceptionRecordDTO exDto = new ExceptionRecordDTO();
        exDto.setExceptionID(1L);
        requiredResponseDTO = new RequiredResponseDTO();
        requiredResponseDTO.setExceptiondto(exDto);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    // ── Auth helpers ─────────────────────────────────────────────────────────

    /**
     * Simulates a logged-in user (Shipper/Dispatcher).
     * Credentials must be the raw JWT string — ClaimServiceImpl calls
     * authentication.getCredentials() and passes it to jwtUtil.
     */
    private void setAuthWithToken() {
        var auth = new UsernamePasswordAuthenticationToken(
                "test@user.com", DUMMY_TOKEN,
                List.of(new SimpleGrantedAuthority("ROLE_SHIPPER")));
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    /** Simulates an Admin user. */
    private void setAuthAsAdmin() {
        var auth = new UsernamePasswordAuthenticationToken(
                "admin@user.com", DUMMY_TOKEN,
                List.of(new SimpleGrantedAuthority("ROLE_Admin")));
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    // ── createClaim ───────────────────────────────────────────────────────────

    @Test
    void createClaim_ShouldSaveAndReturnDTO() {
        setAuthWithToken();
        when(jwtUtil.extractUserId(DUMMY_TOKEN)).thenReturn(TEST_USER_ID);
        when(exceptionRepo.findById(1L)).thenReturn(Optional.of(exceptionRecord));
        when(repo.save(any(Claim.class))).thenReturn(claim);
        when(exceptionService.getExceptionById(1L)).thenReturn(requiredResponseDTO);

        ClaimDTO result = claimService.createClaim(dto);

        assertNotNull(result);
        assertEquals(1L, result.getClaimID());
        // filedBy must be set from authenticated userId, not from DTO
        assertEquals(TEST_USER_ID, result.getFiledBy());
        verify(repo, times(1)).save(any(Claim.class));
    }

    @Test
    void createClaim_ShouldThrowBadRequest_WhenExceptionIdIsNull() {
        // Validated before auth context is read — no SecurityContext setup needed
        dto.setExceptionID(null);

        assertThrows(BadRequestException.class, () -> claimService.createClaim(dto));
        verify(repo, never()).save(any());
    }

    @Test
    void createClaim_ShouldThrowBadRequest_WhenAmountIsZeroOrNegative() {
        dto.setAmountClaimed(0.0);

        assertThrows(BadRequestException.class, () -> claimService.createClaim(dto));
        verify(repo, never()).save(any());
    }

    // ── getAllClaims ──────────────────────────────────────────────────────────

    @Test
    void getAllClaims_AsAdmin_ShouldReturnAllClaims() {
        setAuthAsAdmin();
        when(jwtUtil.extractUserId(DUMMY_TOKEN)).thenReturn(TEST_USER_ID);
        when(jwtUtil.extractRole(DUMMY_TOKEN)).thenReturn("Admin");
        when(repo.findAll()).thenReturn(List.of(claim));
        when(exceptionService.getExceptionById(1L)).thenReturn(requiredResponseDTO);

        List<ClaimDTO> result = claimService.getAllClaims();

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(1L, result.get(0).getClaimID());
        verify(repo).findAll();
        verify(repo, never()).findByFiledBy(any());
    }

    @Test
    void getAllClaims_AsAdmin_ShouldReturnEmptyList() {
        setAuthAsAdmin();
        when(jwtUtil.extractUserId(DUMMY_TOKEN)).thenReturn(TEST_USER_ID);
        when(jwtUtil.extractRole(DUMMY_TOKEN)).thenReturn("Admin");
        when(repo.findAll()).thenReturn(List.of());

        List<ClaimDTO> result = claimService.getAllClaims();

        assertNotNull(result);
        assertTrue(result.isEmpty());
    }

    @Test
    void getAllClaims_AsShipper_ShouldReturnOwnClaims() {
        setAuthWithToken();
        when(jwtUtil.extractUserId(DUMMY_TOKEN)).thenReturn(TEST_USER_ID);
        when(jwtUtil.extractRole(DUMMY_TOKEN)).thenReturn("SHIPPER");
        when(repo.findByFiledBy(TEST_USER_ID)).thenReturn(List.of(claim));
        when(exceptionService.getExceptionById(1L)).thenReturn(requiredResponseDTO);

        List<ClaimDTO> result = claimService.getAllClaims();

        assertNotNull(result);
        assertEquals(1, result.size());
        verify(repo).findByFiledBy(TEST_USER_ID);
        verify(repo, never()).findAll();
    }

    // ── getClaimById ──────────────────────────────────────────────────────────

    @Test
    void getClaimById_ShouldReturnDTO() {
        when(repo.findById(1L)).thenReturn(Optional.of(claim));
        when(exceptionService.getExceptionById(1L)).thenReturn(requiredResponseDTO);

        ClaimDTO result = claimService.getClaimById(1L);

        assertNotNull(result);
        assertEquals(1L, result.getClaimID());
        assertEquals(ClaimStatus.OPEN, result.getStatus());
    }

    @Test
    void getClaimById_ShouldThrowWhenNotFound() {
        when(repo.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> claimService.getClaimById(99L));
    }

    // ── updateClaimStatus ─────────────────────────────────────────────────────

    @Test
    void updateClaimStatus_ShouldUpdateAndReturn() {
        Claim settled = new Claim();
        settled.setClaimID(1L);
        settled.setStatus(ClaimStatus.SETTLED);
        settled.setExceptionRecord(exceptionRecord);

        when(repo.findById(1L)).thenReturn(Optional.of(claim));
        when(repo.save(any(Claim.class))).thenReturn(settled);
        when(exceptionService.getExceptionById(1L)).thenReturn(requiredResponseDTO);

        ClaimDTO result = claimService.updateClaimStatus(1L, ClaimStatus.SETTLED);

        assertNotNull(result);
        assertEquals(ClaimStatus.SETTLED, result.getStatus());
        verify(repo).save(any(Claim.class));
    }

    @Test
    void updateClaimStatus_ShouldThrowWhenNotFound() {
        when(repo.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> claimService.updateClaimStatus(99L, ClaimStatus.SETTLED));
    }

    // ── getClaimByExceptionId ─────────────────────────────────────────────────

    @Test
    void getClaimByExceptionId_ShouldReturnList() {
        when(repo.findByExceptionRecord_ExceptionID(1L)).thenReturn(List.of(claim));
        when(exceptionService.getExceptionById(1L)).thenReturn(requiredResponseDTO);

        List<ClaimDTO> result = claimService.getClaimByExceptionId(1L);

        assertNotNull(result);
        assertEquals(1, result.size());
    }

    // ── getClaimByStatus ──────────────────────────────────────────────────────

    @Test
    void getClaimByStatus_ShouldReturnList() {
        when(repo.findByStatus(ClaimStatus.OPEN)).thenReturn(List.of(claim));
        when(exceptionService.getExceptionById(1L)).thenReturn(requiredResponseDTO);

        List<ClaimDTO> result = claimService.getClaimByStatus(ClaimStatus.OPEN);

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(ClaimStatus.OPEN, result.get(0).getStatus());
    }

    @Test
    void getClaimByStatus_ShouldReturnEmptyList() {
        when(repo.findByStatus(ClaimStatus.CANCELLED)).thenReturn(List.of());

        List<ClaimDTO> result = claimService.getClaimByStatus(ClaimStatus.CANCELLED);

        assertNotNull(result);
        assertTrue(result.isEmpty());
    }
}
