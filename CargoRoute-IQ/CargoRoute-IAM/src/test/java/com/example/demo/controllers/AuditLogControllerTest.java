package com.example.demo.controllers;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.IntStream;
import java.util.stream.Stream;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import com.example.demo.DTO.AuditLogDTO;
import com.example.demo.services.AuditLogService;

class AuditLogControllerTest {

    @Test
    void createLog_returnsCreated() {
        AuditLogService service = org.mockito.Mockito.mock(AuditLogService.class);
        AuditLogController controller = new AuditLogController(service);

        AuditLogDTO dto = dto(1);
        when(service.saveAuditLog(dto)).thenReturn(dto);

        ResponseEntity<AuditLogDTO> response = controller.createLog(dto);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertEquals(1L, response.getBody().getUserID());
    }

    @Test
    void getAllLogs_returnsOk() {
        AuditLogService service = org.mockito.Mockito.mock(AuditLogService.class);
        AuditLogController controller = new AuditLogController(service);

        when(service.getAllAuditLogs()).thenReturn(List.of(dto(1), dto(2)));

        ResponseEntity<List<AuditLogDTO>> response = controller.getAllLogs();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(2, response.getBody().size());
    }

//    @Test
//    void getLogById_returnsOk() {
//        AuditLogService service = org.mockito.Mockito.mock(AuditLogService.class);
//        AuditLogController controller = new AuditLogController(service);
//
//        when(service.getAuditLogsById(8L)).thenReturn(dto(8));
//
//        ResponseEntity<AuditLogDTO> response = controller.getLogById(8L);
//
//        assertEquals(HttpStatus.OK, response.getStatusCode());
//        assertEquals(8L, response.getBody().getUserID());
//    }

    @ParameterizedTest(name = "create log case {0}")
    @MethodSource("createCases")
    void createLog_parameterizedCases(int i) {
        AuditLogService service = org.mockito.Mockito.mock(AuditLogService.class);
        AuditLogController controller = new AuditLogController(service);

        AuditLogDTO input = dto(i);
        when(service.saveAuditLog(input)).thenReturn(input);

        ResponseEntity<AuditLogDTO> response = controller.createLog(input);

        assertNotNull(response.getBody());
        assertEquals("DETAIL-" + i, response.getBody().getDetails());
    }

//    @ParameterizedTest(name = "get by id case {0}")
//    @MethodSource("getByIdCases")
//    void getLogById_parameterizedCases(long id) {
//        AuditLogService service = org.mockito.Mockito.mock(AuditLogService.class);
//        AuditLogController controller = new AuditLogController(service);
//
//        AuditLogDTO output = dto((int) id);
//        output.setAuditID(id);
//        when(service.getAuditLogById(id)).thenReturn(output);
//
//        ResponseEntity<AuditLogDTO> response = controller.getLogById(id);
//
//        assertEquals(id, response.getBody().getAuditID());
//    }

    private static Stream<Arguments> createCases() {
        return IntStream.rangeClosed(1, 5).mapToObj(Arguments::of);
    }

    private static Stream<Arguments> getByIdCases() {
        return Stream.of(1L, 2L, 3L, 4L, 5L).map(Arguments::of);
    }

    private AuditLogDTO dto(int i) {
        AuditLogDTO dto = new AuditLogDTO();
        dto.setAuditID((long) i);
        dto.setUserID((long) i);
        dto.setAction(i % 2 == 0 ? "UPDATE" : "CREATE");
        dto.setResourceType("USER");
        dto.setResourceID((long) (100 + i));
        dto.setDetails("DETAIL-" + i);
        dto.setTimestamp(LocalDateTime.now());
        return dto;
    }
}
