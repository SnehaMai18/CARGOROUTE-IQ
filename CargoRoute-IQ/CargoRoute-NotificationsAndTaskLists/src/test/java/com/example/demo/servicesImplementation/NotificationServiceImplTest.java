package com.example.demo.servicesImplementation;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.client.RestTemplate;

import com.example.demo.DTO.InternalUserDTO;
import com.example.demo.DTO.NotificationDTO;
import com.example.demo.DTO.NotificationResponseDTO;
import com.example.demo.entities.Notification;
import com.example.demo.enums.NotificationCategory;
import com.example.demo.exceptions.ResourceNotFoundException;
import com.example.demo.repositories.NotificationRepository;

@ExtendWith(MockitoExtension.class)
class NotificationServiceImplTest {

    @Mock
    private NotificationRepository repository;

    @Mock
    private RestTemplate restTemplate;

    private NotificationServiceImpl service;

    @BeforeEach
    void setUp() {
        service = new NotificationServiceImpl(repository, restTemplate);
    }

    private NotificationDTO dto(Long id, Long userId, NotificationCategory category, String message) {
        NotificationDTO dto = new NotificationDTO();
        dto.setNotificationID(id);
        dto.setUserID(userId);
        dto.setEntityID(700L + id);
        dto.setCategory(category);
        dto.setMessage(message);
        dto.setStatus("UNREAD");
        dto.setCreatedAt(LocalDateTime.of(2026, 4, 14, 9, 0).plusMinutes(id));
        return dto;
    }

    private Notification entity(Long id, Long userId, NotificationCategory category, String message, String status) {
        Notification n = new Notification();
        n.setNotificationID(id);
        n.setUserID(userId);
        n.setEntityID(700L + id);
        n.setCategory(category);
        n.setMessage(message);
        n.setStatus(status);
        return n;
    }

    @Test
    void create_shouldSaveAndMapToDto_whenUserExists() {
        NotificationDTO input = dto(1L, 10L, NotificationCategory.Pickup, "Pickup confirmed");
        Notification saved = entity(1L, 10L, NotificationCategory.Pickup, "Pickup confirmed", "UNREAD");

        when(restTemplate.getForObject("http://Identity-Access-Management/internal/users/10", Boolean.class)).thenReturn(true);
        when(repository.save(any(Notification.class))).thenReturn(saved);

        NotificationDTO result = service.create(input);

        assertEquals(1L, result.getNotificationID());
        assertEquals(10L, result.getUserID());
        assertEquals("UNREAD", result.getStatus());
        verify(repository).save(any(Notification.class));
    }

    @Test
    void create_shouldThrow_whenUserServiceReturnsFalse() {
        NotificationDTO input = dto(2L, 20L, NotificationCategory.Delivery, "Delivered");
        when(restTemplate.getForObject("http://Identity-Access-Management/internal/users/20", Boolean.class)).thenReturn(false);

        ResourceNotFoundException ex = assertThrows(ResourceNotFoundException.class, () -> service.create(input));

        assertTrue(ex.getMessage().contains("20"));
        verify(repository, never()).save(any());
    }

    @Test
    void create_shouldThrow_whenUserServiceReturnsNull() {
        NotificationDTO input = dto(3L, 30L, NotificationCategory.Exception, "Incident");
        when(restTemplate.getForObject("http://Identity-Access-Management/internal/users/30", Boolean.class)).thenReturn(null);

        assertThrows(ResourceNotFoundException.class, () -> service.create(input));
        verify(repository, never()).save(any());
    }

    @Test
    void create_shouldSetStatusUnreadRegardlessOfInput() {
        NotificationDTO input = dto(4L, 40L, NotificationCategory.Invoice, "Invoice generated");
        input.setStatus("READ");
        Notification saved = entity(4L, 40L, NotificationCategory.Invoice, "Invoice generated", "UNREAD");

        when(restTemplate.getForObject("http://Identity-Access-Management/internal/users/40", Boolean.class)).thenReturn(true);
        when(repository.save(any(Notification.class))).thenReturn(saved);

        NotificationDTO result = service.create(input);

        assertEquals("UNREAD", result.getStatus());
    }

    @Test
    void create_shouldPassExpectedEntityFieldsToRepository() {
        NotificationDTO input = dto(5L, 50L, NotificationCategory.Delivery, "ETA changed");
        Notification saved = entity(5L, 50L, NotificationCategory.Delivery, "ETA changed", "UNREAD");
        ArgumentCaptor<Notification> captor = ArgumentCaptor.forClass(Notification.class);

        when(restTemplate.getForObject("http://Identity-Access-Management/internal/users/50", Boolean.class)).thenReturn(true);
        when(repository.save(any(Notification.class))).thenReturn(saved);

        service.create(input);

        verify(repository).save(captor.capture());
        Notification actual = captor.getValue();
        assertEquals(50L, actual.getUserID());
        assertEquals(input.getEntityID(), actual.getEntityID());
        assertEquals("ETA changed", actual.getMessage());
        assertEquals(NotificationCategory.Delivery, actual.getCategory());
        assertEquals("UNREAD", actual.getStatus());
    }

    @Test
    void create_shouldPropagateRestClientExceptions() {
        NotificationDTO input = dto(6L, 60L, NotificationCategory.Pickup, "Rest error");
        when(restTemplate.getForObject(anyString(), eq(Boolean.class))).thenThrow(new RuntimeException("IAM down"));

        RuntimeException ex = assertThrows(RuntimeException.class, () -> service.create(input));

        assertEquals("IAM down", ex.getMessage());
        verify(repository, never()).save(any());
    }

    @Test
    void getById_shouldReturnMappedDto_whenFound() {
        Notification found = entity(7L, 70L, NotificationCategory.Exception, "Temp issue", "UNREAD");
        when(repository.findById(7L)).thenReturn(Optional.of(found));

        NotificationDTO result = service.getById(7L);

        assertEquals(7L, result.getNotificationID());
        assertEquals(70L, result.getUserID());
        assertEquals("Temp issue", result.getMessage());
    }

    @Test
    void getById_shouldThrow_whenMissing() {
        when(repository.findById(700L)).thenReturn(Optional.empty());

        ResourceNotFoundException ex = assertThrows(ResourceNotFoundException.class, () -> service.getById(700L));

        assertTrue(ex.getMessage().contains("700"));
    }

    @Test
    void getById_shouldMapCategoryCorrectly() {
        Notification found = entity(8L, 80L, NotificationCategory.Invoice, "Invoice sent", "UNREAD");
        when(repository.findById(8L)).thenReturn(Optional.of(found));

        NotificationDTO result = service.getById(8L);

        assertEquals(NotificationCategory.Invoice, result.getCategory());
    }

    @Test
    void getById_shouldMapStatusCorrectly() {
        Notification found = entity(9L, 90L, NotificationCategory.Delivery, "Delivered", "READ");
        when(repository.findById(9L)).thenReturn(Optional.of(found));

        NotificationDTO result = service.getById(9L);

        assertEquals("READ", result.getStatus());
    }

    @Test
    void getAll_shouldReturnMappedList() {
        Notification a = entity(10L, 100L, NotificationCategory.Pickup, "A", "UNREAD");
        Notification b = entity(11L, 110L, NotificationCategory.Delivery, "B", "READ");
        when(repository.findAll()).thenReturn(List.of(a, b));

        List<NotificationDTO> result = service.getAll();

        assertEquals(2, result.size());
        assertEquals(10L, result.get(0).getNotificationID());
        assertEquals(11L, result.get(1).getNotificationID());
    }

    @Test
    void getAll_shouldReturnEmptyList_whenNoData() {
        when(repository.findAll()).thenReturn(Collections.emptyList());

        List<NotificationDTO> result = service.getAll();

        assertTrue(result.isEmpty());
    }

    @Test
    void getAll_shouldPreserveMessages() {
        Notification a = entity(12L, 120L, NotificationCategory.Pickup, "Loaded", "UNREAD");
        Notification b = entity(13L, 130L, NotificationCategory.Exception, "Customs hold", "UNREAD");
        when(repository.findAll()).thenReturn(List.of(a, b));

        List<NotificationDTO> result = service.getAll();

        assertEquals("Loaded", result.get(0).getMessage());
        assertEquals("Customs hold", result.get(1).getMessage());
    }

    @Test
    void getNotificationWithUser_shouldReturnAggregatedResponse() {
        Notification found = entity(14L, 140L, NotificationCategory.Invoice, "Bill raised", "UNREAD");
        InternalUserDTO user = new InternalUserDTO(140L, "Karan", "k@x.com", "Dispatcher");

        when(repository.findById(14L)).thenReturn(Optional.of(found));
        when(restTemplate.getForObject("http://Identity-Access-Management/internal/users/140", InternalUserDTO.class)).thenReturn(user);

        NotificationResponseDTO result = service.getNotificationWithUser(14L);

        assertNotNull(result.getNotification());
        assertNotNull(result.getUser());
        assertEquals("Karan", result.getUser().getName());
        assertEquals(14L, result.getNotification().getNotificationID());
    }

    @Test
    void getNotificationWithUser_shouldIncludeNotificationEvenIfUserNull() {
        Notification found = entity(15L, 150L, NotificationCategory.Delivery, "Drop completed", "READ");

        when(repository.findById(15L)).thenReturn(Optional.of(found));
        when(restTemplate.getForObject("http://Identity-Access-Management/internal/users/150", InternalUserDTO.class)).thenReturn(null);

        NotificationResponseDTO result = service.getNotificationWithUser(15L);

        assertNotNull(result.getNotification());
        assertNull(result.getUser());
    }

    @Test
    void getNotificationWithUser_shouldThrow_whenNotificationMissing() {
        when(repository.findById(1515L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> service.getNotificationWithUser(1515L));
        verify(restTemplate, never()).getForObject(anyString(), eq(InternalUserDTO.class));
    }

    @Test
    void getNotificationWithUser_shouldPropagateRestFailure() {
        Notification found = entity(16L, 160L, NotificationCategory.Pickup, "Assigned", "UNREAD");
        when(repository.findById(16L)).thenReturn(Optional.of(found));
        when(restTemplate.getForObject(anyString(), eq(InternalUserDTO.class))).thenThrow(new RuntimeException("IAM timeout"));

        RuntimeException ex = assertThrows(RuntimeException.class, () -> service.getNotificationWithUser(16L));

        assertEquals("IAM timeout", ex.getMessage());
    }

    @Test
    void fallbackUser_shouldReturnNotificationAndNullUser() {
        Notification found = entity(17L, 170L, NotificationCategory.Exception, "Fallback sample", "UNREAD");
        when(repository.findById(17L)).thenReturn(Optional.of(found));

        NotificationResponseDTO result = service.fallbackUser(17L, new RuntimeException("cb open"));

        assertNotNull(result.getNotification());
        assertNull(result.getUser());
        assertEquals(17L, result.getNotification().getNotificationID());
    }

    @Test
    void fallbackUser_shouldThrow_whenNotificationMissing() {
        when(repository.findById(1717L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> service.fallbackUser(1717L, new RuntimeException("x")));
    }

    @Test
    void delete_shouldCallRepositoryDelete_whenExists() {
        when(repository.existsById(18L)).thenReturn(true);

        service.delete(18L);

        verify(repository).deleteById(18L);
    }

    @Test
    void delete_shouldThrow_whenNotExists() {
        when(repository.existsById(1818L)).thenReturn(false);

        assertThrows(ResourceNotFoundException.class, () -> service.delete(1818L));
        verify(repository, never()).deleteById(anyLong());
    }

    @Test
    void delete_shouldCheckExistsBeforeDeleting() {
        when(repository.existsById(19L)).thenReturn(true);

        service.delete(19L);

        verify(repository).existsById(19L);
        verify(repository).deleteById(19L);
    }

    @Test
    void create_shouldUseExpectedUserValidationEndpoint() {
        NotificationDTO input = dto(20L, 200L, NotificationCategory.Pickup, "endpoint");
        Notification saved = entity(20L, 200L, NotificationCategory.Pickup, "endpoint", "UNREAD");

        when(restTemplate.getForObject(anyString(), eq(Boolean.class))).thenReturn(true);
        when(repository.save(any(Notification.class))).thenReturn(saved);

        service.create(input);

        verify(restTemplate).getForObject("http://Identity-Access-Management/internal/users/200", Boolean.class);
    }

    @Test
    void getNotificationWithUser_shouldUseExpectedUserFetchEndpoint() {
        Notification found = entity(21L, 210L, NotificationCategory.Delivery, "endpoint user", "UNREAD");
        when(repository.findById(21L)).thenReturn(Optional.of(found));
        when(restTemplate.getForObject(anyString(), eq(InternalUserDTO.class))).thenReturn(new InternalUserDTO());

        service.getNotificationWithUser(21L);

        verify(restTemplate).getForObject("http://Identity-Access-Management/internal/users/210", InternalUserDTO.class);
    }

    @Test
    void create_shouldRetainCategoryValue() {
        NotificationDTO input = dto(22L, 220L, NotificationCategory.Exception, "retain category");
        Notification saved = entity(22L, 220L, NotificationCategory.Exception, "retain category", "UNREAD");
        when(restTemplate.getForObject(anyString(), eq(Boolean.class))).thenReturn(true);
        when(repository.save(any(Notification.class))).thenReturn(saved);

        NotificationDTO result = service.create(input);

        assertEquals(NotificationCategory.Exception, result.getCategory());
    }

    @Test
    void create_shouldReturnMappedEntityId() {
        NotificationDTO input = dto(23L, 230L, NotificationCategory.Invoice, "entity id map");
        Notification saved = entity(23L, 230L, NotificationCategory.Invoice, "entity id map", "UNREAD");
        when(restTemplate.getForObject(anyString(), eq(Boolean.class))).thenReturn(true);
        when(repository.save(any(Notification.class))).thenReturn(saved);

        NotificationDTO result = service.create(input);

        assertEquals(723L, result.getEntityID());
    }

    @Test
    void getAll_shouldMapEveryItemWithoutLoss() {
        Notification a = entity(24L, 240L, NotificationCategory.Pickup, "M1", "UNREAD");
        Notification b = entity(25L, 250L, NotificationCategory.Delivery, "M2", "READ");
        Notification c = entity(26L, 260L, NotificationCategory.Exception, "M3", "UNREAD");
        when(repository.findAll()).thenReturn(List.of(a, b, c));

        List<NotificationDTO> result = service.getAll();

        assertEquals(List.of(24L, 25L, 26L), result.stream().map(NotificationDTO::getNotificationID).toList());
    }

    @Test
    void getById_shouldMapEntityIdField() {
        Notification found = entity(27L, 270L, NotificationCategory.Invoice, "map entity", "UNREAD");
        when(repository.findById(27L)).thenReturn(Optional.of(found));

        NotificationDTO result = service.getById(27L);

        assertEquals(727L, result.getEntityID());
    }

    @Test
    void create_shouldNotInvokeFindOperations() {
        NotificationDTO input = dto(28L, 280L, NotificationCategory.Delivery, "no find");
        Notification saved = entity(28L, 280L, NotificationCategory.Delivery, "no find", "UNREAD");
        when(restTemplate.getForObject(anyString(), eq(Boolean.class))).thenReturn(true);
        when(repository.save(any(Notification.class))).thenReturn(saved);

        service.create(input);

        verify(repository, never()).findById(anyLong());
        verify(repository, never()).findAll();
    }

    @Test
    void getById_shouldCallRepositoryOnce() {
        when(repository.findById(29L)).thenReturn(Optional.of(entity(29L, 290L, NotificationCategory.Pickup, "once", "UNREAD")));

        service.getById(29L);

        verify(repository, times(1)).findById(29L);
    }

    @Test
    void getAll_shouldCallRepositoryOnce() {
        when(repository.findAll()).thenReturn(List.of(entity(30L, 300L, NotificationCategory.Pickup, "x", "UNREAD")));

        service.getAll();

        verify(repository, times(1)).findAll();
    }

    @Test
    void getNotificationWithUser_shouldInvokeFindAndUserFetchOnce() {
        when(repository.findById(31L)).thenReturn(Optional.of(entity(31L, 310L, NotificationCategory.Exception, "x", "UNREAD")));
        when(restTemplate.getForObject(anyString(), eq(InternalUserDTO.class))).thenReturn(new InternalUserDTO());

        service.getNotificationWithUser(31L);

        verify(repository, times(1)).findById(31L);
        verify(restTemplate, times(1)).getForObject("http://Identity-Access-Management/internal/users/310", InternalUserDTO.class);
    }

    @Test
    void delete_shouldNotCallFindById() {
        when(repository.existsById(32L)).thenReturn(true);

        service.delete(32L);

        verify(repository, never()).findById(anyLong());
    }
}
