package com.example.demo.servicesImplementation;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.IntStream;
import java.util.stream.Stream;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.example.demo.DTO.AuditLogDTO;
import com.example.demo.entities.AuditLog;
import com.example.demo.exceptions.ResourceNotFoundException;
import com.example.demo.repositories.AuditLogRepository;
import com.example.demo.serviceimpl.AuditLogServiceImpl;

@ExtendWith(MockitoExtension.class)
class AuditLogServiceImplTest {

    @Mock
    private AuditLogRepository repository;

    @InjectMocks
    private AuditLogServiceImpl service;

    @Test
    void saveAuditLog_mapsFieldsAndSetsTimestamp() {
        AuditLogDTO dto = buildDto(10L);
        AuditLog saved = buildEntity(1L, 10L);
        when(repository.save(any(AuditLog.class))).thenReturn(saved);

        AuditLogDTO result = service.saveAuditLog(dto);

        assertEquals(1L, result.getAuditID());
        assertEquals("CREATE", result.getAction());
        assertNotNull(result.getTimestamp());
    }

    @Test
    void getAllAuditLogs_returnsMappedList() {
        when(repository.findAll()).thenReturn(List.of(buildEntity(1L, 11L), buildEntity(2L, 12L)));

        List<AuditLogDTO> result = service.getAllAuditLogs();

        assertEquals(2, result.size());
        assertEquals(12L, result.get(1).getUserID());
    }

    @Test
    void getAllAuditLogs_returnsEmptyList() {
        when(repository.findAll()).thenReturn(List.of());

        List<AuditLogDTO> result = service.getAllAuditLogs();

        assertTrue(result.isEmpty());
    }

//    @Test
//    void getAuditLogById_returnsData() {
//        when(repository.findById(7L)).thenReturn(Optional.of(buildEntity(7L, 77L)));
//
//        AuditLogDTO result = service.getAuditLogById(7L);
//
//        assertEquals(7L, result.getAuditID());
//        assertEquals(77L, result.getUserID());
//    }
//
//    @Test
//    void getAuditLogById_throwsWhenMissing() {
//        when(repository.findById(99L)).thenReturn(Optional.empty());
//
//        ResourceNotFoundException ex = assertThrows(ResourceNotFoundException.class, () -> service.getAuditLogById(99L));
//
//        assertTrue(ex.getMessage().contains("99"));
//    }

    @ParameterizedTest(name = "save audit log case {0}")
    @MethodSource("auditIds")
    void saveAuditLog_parameterizedCases(int i) {
        AuditLogDTO dto = new AuditLogDTO();
        dto.setUserID((long) i);
        dto.setAction(i % 2 == 0 ? "UPDATE" : "CREATE");
        dto.setResourceType("USER");
        dto.setResourceID((long) (100 + i));
        dto.setDetails("details-" + i);

        AuditLog saved = new AuditLog((long) i, (long) i, dto.getAction(), "USER", (long) (100 + i), dto.getDetails(), LocalDateTime.now());
        when(repository.save(any(AuditLog.class))).thenReturn(saved);

        AuditLogDTO result = service.saveAuditLog(dto);

        assertEquals(i, result.getAuditID());
        assertEquals("details-" + i, result.getDetails());
    }

    private static Stream<Arguments> auditIds() {
        return IntStream.rangeClosed(1, 15).mapToObj(Arguments::of);
    }

    private AuditLogDTO buildDto(Long userId) {
        AuditLogDTO dto = new AuditLogDTO();
        dto.setUserID(userId);
        dto.setAction("CREATE");
        dto.setResourceType("USER");
        dto.setResourceID(101L);
        dto.setDetails("created user");
        return dto;
    }

    private AuditLog buildEntity(Long auditId, Long userId) {
        return new AuditLog(auditId, userId, "CREATE", "USER", 101L, "created user", LocalDateTime.now());
    }
}
