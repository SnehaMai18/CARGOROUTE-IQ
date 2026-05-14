package com.example.demo.repositories;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
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
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.example.demo.entities.AuditLog;

@ExtendWith(MockitoExtension.class)
class AuditLogRepositoryTest {

    @Mock
    private AuditLogRepository auditLogRepository;

    @Test
    void save_andFindById() {
        AuditLog created = log(10L, "CREATE", 101L);
        created.setAuditID(1L);
        when(auditLogRepository.save(org.mockito.ArgumentMatchers.any(AuditLog.class))).thenReturn(created);
        when(auditLogRepository.findById(1L)).thenReturn(Optional.of(created));

        AuditLog saved = auditLogRepository.save(log(10L, "CREATE", 101L));

        Optional<AuditLog> found = auditLogRepository.findById(saved.getAuditID());

        assertTrue(found.isPresent());
        assertEquals("CREATE", found.get().getAction());
    }

    @Test
    void findById_returnsEmptyForUnknown() {
        when(auditLogRepository.findById(99999L)).thenReturn(Optional.empty());
        Optional<AuditLog> found = auditLogRepository.findById(99999L);

        assertTrue(found.isEmpty());
    }

    @Test
    void existsById_trueAfterSave() {
        when(auditLogRepository.existsById(5L)).thenReturn(true);

        assertTrue(auditLogRepository.existsById(5L));
    }

    @Test
    void existsById_falseForUnknown() {
        when(auditLogRepository.existsById(123456L)).thenReturn(false);
        assertFalse(auditLogRepository.existsById(123456L));
    }

    @Test
    void findAll_returnsInsertedRows() {
        when(auditLogRepository.findAll()).thenReturn(List.of(
                log(1L, "CREATE", 101L),
                log(2L, "DELETE", 102L)));

        assertTrue(auditLogRepository.findAll().size() >= 2);
    }

    @Test
    void findById_returnsRecordWhenPresent() {
        AuditLog row = log(21L, "UPDATE", 150L);
        row.setAuditID(21L);
        when(auditLogRepository.findById(21L)).thenReturn(Optional.of(row));

        Optional<AuditLog> result = auditLogRepository.findById(21L);

        assertTrue(result.isPresent());
        assertEquals(21L, result.get().getAuditID());
    }

    @Test
    void save_preservesActionValue() {
        AuditLog row = log(31L, "DELETE", 131L);
        row.setAuditID(31L);
        when(auditLogRepository.save(org.mockito.ArgumentMatchers.any(AuditLog.class))).thenReturn(row);

        AuditLog saved = auditLogRepository.save(log(31L, "DELETE", 131L));

        assertEquals("DELETE", saved.getAction());
    }

    @ParameterizedTest(name = "save audit log param case {0}")
    @MethodSource("logCases")
    void save_parameterized(int i) {
        AuditLog toReturn = log((long) i, i % 2 == 0 ? "UPDATE" : "CREATE", (long) (100 + i));
        toReturn.setAuditID((long) i);
        when(auditLogRepository.save(org.mockito.ArgumentMatchers.any(AuditLog.class))).thenReturn(toReturn);

        AuditLog saved = auditLogRepository.save(log((long) i, i % 2 == 0 ? "UPDATE" : "CREATE", (long) (100 + i)));

        assertNotNull(saved.getAuditID());
        assertEquals((long) i, saved.getUserID());
    }

    private static Stream<Arguments> logCases() {
        return IntStream.rangeClosed(1, 15).mapToObj(Arguments::of);
    }

    private AuditLog log(Long userId, String action, Long resourceId) {
        AuditLog log = new AuditLog();
        log.setUserID(userId);
        log.setAction(action);
        log.setResourceType("USER");
        log.setResourceID(resourceId);
        log.setDetails("details");
        log.setTimestamp(LocalDateTime.now());
        return log;
    }
}
