package com.example.demo.serviceimpl;

import com.example.demo.dto.BookingDetailsDTO;
import com.example.demo.dto.ExceptionRecordDTO;
import com.example.demo.dto.RequiredResponseDTO;
import com.example.demo.entity.ExceptionRecord;
import com.example.demo.entity.enums.ExceptionStatus;
import com.example.demo.entity.enums.ExceptionType;
import com.example.demo.exception.BadRequestException;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.ExceptionRepository;
import com.example.demo.security.JwtUtil;

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
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ExceptionServiceImplTest {

    @Mock
    private ExceptionRepository repo;

    @Mock
    private RestTemplate restTemplate;

    @Mock
    private JwtUtil jwtUtil;

    @InjectMocks
    private ExceptionServiceImpl exceptionService;

    private ExceptionRecord record;
    private ExceptionRecordDTO dto;
    private BookingDetailsDTO bookingDto;

    private static final Long TEST_USER_ID = 1L;
    private static final String TOKEN = "valid.jwt.token";

    @BeforeEach
    void setUp() {
        record = new ExceptionRecord();
        record.setExceptionID(1L);
        record.setType(ExceptionType.DELAY);
        record.setReportedBy(TEST_USER_ID);
        record.setDescription("Cargo delayed");
        record.setStatus(ExceptionStatus.PENDING);
        record.setBookingId(1L);

        dto = new ExceptionRecordDTO();
        dto.setExceptionID(1L);
        dto.setType(ExceptionType.DELAY);
        dto.setDescription("Cargo delayed");
        dto.setStatus(ExceptionStatus.PENDING);
        dto.setBookingId(1L);

        bookingDto = new BookingDetailsDTO();
        bookingDto.setBookingID(1L);
        bookingDto.setCommodity("Electronics");
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    // ───────────────────────── Auth Helpers ─────────────────────────

    private void setAuth(String role) {
        var auth = new UsernamePasswordAuthenticationToken(
                "user", TOKEN,
                List.of(new SimpleGrantedAuthority("ROLE_" + role))
        );
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    // ─────────────────────── createException ───────────────────────

    @Test
    void createException_ShouldSaveAndReturnDTO() {
        setAuth("SHIPPER");

        when(jwtUtil.extractUserId(TOKEN)).thenReturn(TEST_USER_ID);
        when(restTemplate.getForObject(
                contains("getBookingById"),
                eq(BookingDetailsDTO.class),
                any(Long.class)))
                .thenReturn(bookingDto);

        when(repo.save(any(ExceptionRecord.class))).thenReturn(record);

        ExceptionRecordDTO result = exceptionService.createException(dto);

        assertNotNull(result);
        assertEquals(TEST_USER_ID, result.getReportedBy());
        assertEquals(ExceptionStatus.PENDING, result.getStatus());
        verify(repo).save(any());
    }

    @Test
    void createException_ShouldThrowBadRequest_WhenBookingIdNull() {
        dto.setBookingId(null);
        assertThrows(BadRequestException.class,
                () -> exceptionService.createException(dto));
        verify(repo, never()).save(any());
    }

    @Test
    void createException_ShouldThrowBadRequest_WhenTypeNull() {
        dto.setType(null);
        assertThrows(BadRequestException.class,
                () -> exceptionService.createException(dto));
    }

    // ─────────────────────── getExceptionById ──────────────────────

    @Test
    void getExceptionById_ShouldReturnWithBooking() {
        when(repo.findById(1L)).thenReturn(Optional.of(record));
        when(restTemplate.getForObject(anyString(),
                eq(BookingDetailsDTO.class), any(Long.class)))
                .thenReturn(bookingDto);

        RequiredResponseDTO result =
                exceptionService.getExceptionById(1L);

        assertNotNull(result);
        assertEquals(1L,
                result.getExceptiondto().getExceptionID());
        assertNotNull(result.getBookingdto());
    }

    @Test
    void getExceptionById_ShouldThrowWhenNotFound() {
        when(repo.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> exceptionService.getExceptionById(99L));
    }

    // ─────────────────────── getAllExceptions ──────────────────────

    @Test
    void getAllExceptions_AsAdmin_ShouldReturnAll() {
        setAuth("ADMIN");

        when(repo.findAll()).thenReturn(List.of(record));
        when(repo.findById(1L)).thenReturn(Optional.of(record));
        when(restTemplate.getForObject(anyString(),
                eq(BookingDetailsDTO.class), any(Long.class)))
                .thenReturn(bookingDto);

        List<RequiredResponseDTO> result =
                exceptionService.getAllExceptions();

        assertEquals(1, result.size());
        verify(repo).findAll();
        verify(repo, never()).findByReportedBy(any());
    }

    @Test
    void getAllExceptions_AsUser_ShouldReturnOwn() {
        setAuth("SHIPPER");

        when(jwtUtil.extractUserId(TOKEN)).thenReturn(TEST_USER_ID);
        when(repo.findByReportedBy(TEST_USER_ID))
                .thenReturn(List.of(record));
        when(repo.findById(1L)).thenReturn(Optional.of(record));
        when(restTemplate.getForObject(anyString(),
                eq(BookingDetailsDTO.class), any(Long.class)))
                .thenReturn(bookingDto);

        List<RequiredResponseDTO> result =
                exceptionService.getAllExceptions();

        assertEquals(1, result.size());
        verify(repo).findByReportedBy(TEST_USER_ID);
        verify(repo, never()).findAll();
    }

    // ───────────────────── updateExceptionStatus ────────────────────

    @Test
    void updateExceptionStatus_ShouldUpdate() {
        when(repo.findById(1L)).thenReturn(Optional.of(record));
        when(repo.save(any(ExceptionRecord.class))).thenAnswer(i -> {
            ExceptionRecord e = i.getArgument(0);
            e.setStatus(ExceptionStatus.RESOLVED);
            return e;
        });

        ExceptionRecordDTO result =
                exceptionService.updateExceptionStatus(
                        1L, ExceptionStatus.RESOLVED);

        assertEquals(ExceptionStatus.RESOLVED, result.getStatus());
    }

    @Test
    void updateExceptionStatus_ShouldThrowWhenMissing() {
        when(repo.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> exceptionService.updateExceptionStatus(
                        99L, ExceptionStatus.RESOLVED));
    }

    // ───────────────────── getExceptionByBookingId ──────────────────

    @Test
    void getExceptionByBookingId_ShouldReturnList() {
        when(repo.findByBookingId(1L)).thenReturn(List.of(record));
        when(repo.findById(1L)).thenReturn(Optional.of(record));

        List<RequiredResponseDTO> result =
                exceptionService.getExceptionByBookingId(1L);

        assertEquals(1, result.size());
    }

    @Test
    void getExceptionByBookingId_ShouldThrowWhenEmpty() {
        when(repo.findByBookingId(99L)).thenReturn(List.of());

        assertThrows(ResourceNotFoundException.class,
                () -> exceptionService.getExceptionByBookingId(99L));
    }

    // ───────────────────── getExceptionByStatus ─────────────────────

    @Test
    void getExceptionByStatus_ShouldReturnList() {
        when(repo.findByStatus(ExceptionStatus.PENDING))
                .thenReturn(List.of(record));
        when(repo.findById(1L)).thenReturn(Optional.of(record));

        List<RequiredResponseDTO> result =
                exceptionService.getExceptionByStatus(
                        ExceptionStatus.PENDING);

        assertEquals(1, result.size());
    }

    @Test
    void getExceptionByStatus_ShouldReturnEmptyList() {
        when(repo.findByStatus(ExceptionStatus.REJECTED))
                .thenReturn(List.of());

        assertTrue(
                exceptionService
                        .getExceptionByStatus(ExceptionStatus.REJECTED)
                        .isEmpty());
    }
}