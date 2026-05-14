package com.example.demo.controllers;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import com.example.demo.DTO.InternalUserDTO;
import com.example.demo.DTO.NotificationDTO;
import com.example.demo.DTO.NotificationResponseDTO;
import com.example.demo.enums.NotificationCategory;
import com.example.demo.exceptions.ResourceNotFoundException;
import com.example.demo.services.NotificationService;

@ExtendWith(MockitoExtension.class)
class NotificationControllerTest {

    @Mock
    private NotificationService notificationService;

    private NotificationController controller;

    @BeforeEach
    void setUp() {
        controller = new NotificationController(notificationService);
    }

    private NotificationDTO notificationDto(Long id, Long userId, String message) {
        NotificationDTO dto = new NotificationDTO();
        dto.setNotificationID(id);
        dto.setUserID(userId);
        dto.setEntityID(500L + id);
        dto.setMessage(message);
        dto.setCategory(NotificationCategory.Delivery);
        dto.setStatus("UNREAD");
        dto.setCreatedAt(LocalDateTime.of(2026, 4, 14, 10, 0).plusMinutes(id));
        return dto;
    }

    @Test
    void create_shouldReturnCreatedAndBody() {
        NotificationDTO input = notificationDto(1L, 10L, "Created");
        when(notificationService.create(input)).thenReturn(input);

        ResponseEntity<NotificationDTO> response = controller.create(input);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertSame(input, response.getBody());
        verify(notificationService).create(input);
    }

    @Test
    void create_shouldPropagateServiceException() {
        NotificationDTO input = notificationDto(2L, 20L, "Error case");
        when(notificationService.create(input)).thenThrow(new ResourceNotFoundException("User missing"));

        assertThrows(ResourceNotFoundException.class, () -> controller.create(input));
        verify(notificationService).create(input);
    }

    @Test
    void getById_shouldReturnOkWithNotification() {
        NotificationDTO dto = notificationDto(3L, 30L, "Found");
        when(notificationService.getById(3L)).thenReturn(dto);

        ResponseEntity<NotificationDTO> response = controller.getById(3L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(3L, response.getBody().getNotificationID());
        verify(notificationService).getById(3L);
    }

    @Test
    void getById_shouldPropagateNotFound() {
        when(notificationService.getById(999L)).thenThrow(new ResourceNotFoundException("Notification not found"));

        assertThrows(ResourceNotFoundException.class, () -> controller.getById(999L));
        verify(notificationService).getById(999L);
    }

    @Test
    void getAll_shouldReturnOkWithList() {
        List<NotificationDTO> list = List.of(
            notificationDto(4L, 40L, "A"),
            notificationDto(5L, 50L, "B")
        );
        when(notificationService.getAll()).thenReturn(list);

        ResponseEntity<List<NotificationDTO>> response = controller.getAll();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(2, response.getBody().size());
        verify(notificationService).getAll();
    }

    @Test
    void getAll_shouldReturnEmptyList() {
        when(notificationService.getAll()).thenReturn(Collections.emptyList());

        ResponseEntity<List<NotificationDTO>> response = controller.getAll();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().isEmpty());
        verify(notificationService).getAll();
    }

    @Test
    void getDetails_shouldReturnNotificationAndUser() {
        NotificationResponseDTO responseDTO = new NotificationResponseDTO();
        responseDTO.setNotification(notificationDto(6L, 60L, "Detail"));
        responseDTO.setUser(new InternalUserDTO(60L, "Ana", "ana@x.com", "Driver"));

        when(notificationService.getNotificationWithUser(6L)).thenReturn(responseDTO);

        ResponseEntity<NotificationResponseDTO> response = controller.getDetails(6L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody().getNotification());
        assertEquals("Ana", response.getBody().getUser().getName());
        verify(notificationService).getNotificationWithUser(6L);
    }

    @Test
    void getDetails_shouldAllowNullUserInFallbackCase() {
        NotificationResponseDTO responseDTO = new NotificationResponseDTO();
        responseDTO.setNotification(notificationDto(7L, 70L, "Fallback"));
        responseDTO.setUser(null);

        when(notificationService.getNotificationWithUser(7L)).thenReturn(responseDTO);

        ResponseEntity<NotificationResponseDTO> response = controller.getDetails(7L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNull(response.getBody().getUser());
        verify(notificationService).getNotificationWithUser(7L);
    }

    @Test
    void getDetails_shouldPropagateNotFound() {
        when(notificationService.getNotificationWithUser(888L)).thenThrow(new ResourceNotFoundException("Missing"));

        assertThrows(ResourceNotFoundException.class, () -> controller.getDetails(888L));
        verify(notificationService).getNotificationWithUser(888L);
    }

    @Test
    void delete_shouldReturnNoContent() {
        doNothing().when(notificationService).delete(8L);

        ResponseEntity<Void> response = controller.delete(8L);

        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
        assertNull(response.getBody());
        verify(notificationService).delete(8L);
    }

    @Test
    void delete_shouldPropagateNotFound() {
        doThrow(new ResourceNotFoundException("Not found")).when(notificationService).delete(777L);

        assertThrows(ResourceNotFoundException.class, () -> controller.delete(777L));
        verify(notificationService).delete(777L);
    }

    @Test
    void create_shouldPreserveMessageContent() {
        NotificationDTO input = notificationDto(9L, 90L, "Route delayed by weather");
        when(notificationService.create(input)).thenReturn(input);

        ResponseEntity<NotificationDTO> response = controller.create(input);

        assertEquals("Route delayed by weather", response.getBody().getMessage());
        verify(notificationService).create(input);
    }

    @Test
    void getById_shouldReturnUnreadStatus() {
        NotificationDTO dto = notificationDto(10L, 100L, "Status check");
        dto.setStatus("UNREAD");
        when(notificationService.getById(10L)).thenReturn(dto);

        ResponseEntity<NotificationDTO> response = controller.getById(10L);

        assertEquals("UNREAD", response.getBody().getStatus());
        verify(notificationService).getById(10L);
    }

    @Test
    void getById_shouldReturnEnumCategory() {
        NotificationDTO dto = notificationDto(11L, 110L, "Category check");
        dto.setCategory(NotificationCategory.Exception);
        when(notificationService.getById(11L)).thenReturn(dto);

        ResponseEntity<NotificationDTO> response = controller.getById(11L);

        assertEquals(NotificationCategory.Exception, response.getBody().getCategory());
        verify(notificationService).getById(11L);
    }

    @Test
    void getAll_shouldReturnStableOrderFromService() {
        NotificationDTO first = notificationDto(12L, 120L, "First");
        NotificationDTO second = notificationDto(13L, 130L, "Second");
        when(notificationService.getAll()).thenReturn(List.of(first, second));

        ResponseEntity<List<NotificationDTO>> response = controller.getAll();

        assertEquals(12L, response.getBody().get(0).getNotificationID());
        assertEquals(13L, response.getBody().get(1).getNotificationID());
        verify(notificationService).getAll();
    }

    @Test
    void getDetails_shouldExposeNestedNotificationId() {
        NotificationResponseDTO responseDTO = new NotificationResponseDTO();
        responseDTO.setNotification(notificationDto(14L, 140L, "Nested id"));
        responseDTO.setUser(new InternalUserDTO(140L, "Riya", "riya@x.com", "Dispatcher"));
        when(notificationService.getNotificationWithUser(14L)).thenReturn(responseDTO);

        ResponseEntity<NotificationResponseDTO> response = controller.getDetails(14L);

        assertEquals(14L, response.getBody().getNotification().getNotificationID());
        verify(notificationService).getNotificationWithUser(14L);
    }
}
