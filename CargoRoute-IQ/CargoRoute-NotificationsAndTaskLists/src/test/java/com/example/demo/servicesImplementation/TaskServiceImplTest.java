package com.example.demo.servicesImplementation;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

import java.time.LocalDate;
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

import com.example.demo.DTO.TaskDTO;
import com.example.demo.entities.Task;
import com.example.demo.exceptions.ResourceNotFoundException;
import com.example.demo.repositories.TaskRepository;

@ExtendWith(MockitoExtension.class)
class TaskServiceImplTest {

    @Mock
    private TaskRepository repository;

    @Mock
    private RestTemplate restTemplate;

    private TaskServiceImpl service;

    @BeforeEach
    void setUp() {
        service = new TaskServiceImpl(repository, restTemplate);
    }

    private TaskDTO dto(Long id, Long assignedTo, String description, String status) {
        TaskDTO dto = new TaskDTO();
        dto.setTaskID(id);
        dto.setAssignedTo(assignedTo);
        dto.setRelatedEntityID(3000L + id);
        dto.setDescription(description);
        dto.setDueDate(LocalDate.of(2026, 4, 14).plusDays(id));
        dto.setStatus(status);
        return dto;
    }

    private Task entity(Long id, Long assignedTo, String description, String status) {
        Task task = new Task();
        task.setTaskID(id);
        task.setAssignedTo(assignedTo);
        task.setRelatedEntityID(3000L + id);
        task.setDescription(description);
        task.setDueDate(LocalDate.of(2026, 4, 14).plusDays(id));
        task.setStatus(status);
        return task;
    }

    @Test
    void create_shouldSaveAndReturnMappedDto_whenUserExists() {
        TaskDTO input = dto(1L, 10L, "Load unit", "PENDING");
        Task saved = entity(1L, 10L, "Load unit", "PENDING");

        when(restTemplate.getForObject("http://Identity-Access-Management/internal/users/10/exists", Boolean.class)).thenReturn(true);
        when(repository.save(any(Task.class))).thenReturn(saved);

        TaskDTO result = service.create(input);

        assertEquals(1L, result.getTaskID());
        assertEquals(10L, result.getAssignedTo());
        assertEquals("Load unit", result.getDescription());
    }

    @Test
    void create_shouldThrow_whenUserDoesNotExist() {
        TaskDTO input = dto(2L, 20L, "Scan docs", "PENDING");
        when(restTemplate.getForObject("http://Identity-Access-Management/internal/users/20/exists", Boolean.class)).thenReturn(false);

        ResourceNotFoundException ex = assertThrows(ResourceNotFoundException.class, () -> service.create(input));

        assertTrue(ex.getMessage().contains("20"));
        verify(repository, never()).save(any());
    }

    @Test
    void create_shouldThrow_whenUserExistsResponseNull() {
        TaskDTO input = dto(3L, 30L, "Pack items", "PENDING");
        when(restTemplate.getForObject("http://Identity-Access-Management/internal/users/30/exists", Boolean.class)).thenReturn(null);

        assertThrows(ResourceNotFoundException.class, () -> service.create(input));
        verify(repository, never()).save(any());
    }

    @Test
    void create_shouldPassExpectedFieldsToRepository() {
        TaskDTO input = dto(4L, 40L, "Route planning", "PENDING");
        Task saved = entity(4L, 40L, "Route planning", "PENDING");
        ArgumentCaptor<Task> captor = ArgumentCaptor.forClass(Task.class);

        when(restTemplate.getForObject("http://Identity-Access-Management/internal/users/40/exists", Boolean.class)).thenReturn(true);
        when(repository.save(any(Task.class))).thenReturn(saved);

        service.create(input);

        verify(repository).save(captor.capture());
        Task actual = captor.getValue();
        assertEquals(40L, actual.getAssignedTo());
        assertEquals(input.getRelatedEntityID(), actual.getRelatedEntityID());
        assertEquals("Route planning", actual.getDescription());
        assertEquals(input.getDueDate(), actual.getDueDate());
        assertEquals("PENDING", actual.getStatus());
    }

    @Test
    void create_shouldPropagateRestErrors() {
        TaskDTO input = dto(5L, 50L, "Rest error", "PENDING");
        when(restTemplate.getForObject(anyString(), eq(Boolean.class))).thenThrow(new RuntimeException("IAM unavailable"));

        RuntimeException ex = assertThrows(RuntimeException.class, () -> service.create(input));

        assertEquals("IAM unavailable", ex.getMessage());
        verify(repository, never()).save(any());
    }

    @Test
    void getAll_shouldReturnMappedTasks() {
        Task a = entity(6L, 60L, "A", "PENDING");
        Task b = entity(7L, 70L, "B", "COMPLETED");
        when(repository.findAll()).thenReturn(List.of(a, b));

        List<TaskDTO> result = service.getAll();

        assertEquals(2, result.size());
        assertEquals(6L, result.get(0).getTaskID());
        assertEquals(7L, result.get(1).getTaskID());
    }

    @Test
    void getAll_shouldReturnEmptyList_whenNoTasks() {
        when(repository.findAll()).thenReturn(Collections.emptyList());

        List<TaskDTO> result = service.getAll();

        assertTrue(result.isEmpty());
    }

    @Test
    void getAll_shouldMapStatuses() {
        Task a = entity(8L, 80L, "Status one", "PENDING");
        Task b = entity(9L, 90L, "Status two", "CANCELLED");
        when(repository.findAll()).thenReturn(List.of(a, b));

        List<TaskDTO> result = service.getAll();

        assertEquals("PENDING", result.get(0).getStatus());
        assertEquals("CANCELLED", result.get(1).getStatus());
    }

    @Test
    void getById_shouldReturnMappedTask_whenFound() {
        when(repository.findById(10L)).thenReturn(Optional.of(entity(10L, 100L, "Inspect vehicle", "PENDING")));

        TaskDTO result = service.getById(10L);

        assertEquals(10L, result.getTaskID());
        assertEquals("Inspect vehicle", result.getDescription());
    }

    @Test
    void getById_shouldThrow_whenMissing() {
        when(repository.findById(1010L)).thenReturn(Optional.empty());

        ResourceNotFoundException ex = assertThrows(ResourceNotFoundException.class, () -> service.getById(1010L));

        assertTrue(ex.getMessage().contains("1010"));
    }

    @Test
    void getById_shouldMapDueDate() {
        Task task = entity(11L, 110L, "Due date map", "PENDING");
        task.setDueDate(LocalDate.of(2026, 6, 1));
        when(repository.findById(11L)).thenReturn(Optional.of(task));

        TaskDTO result = service.getById(11L);

        assertEquals(LocalDate.of(2026, 6, 1), result.getDueDate());
    }

    @Test
    void getById_shouldMapAssignedTo() {
        when(repository.findById(12L)).thenReturn(Optional.of(entity(12L, 1212L, "Assignee map", "PENDING")));

        TaskDTO result = service.getById(12L);

        assertEquals(1212L, result.getAssignedTo());
    }

    @Test
    void delete_shouldDelete_whenTaskExists() {
        when(repository.existsById(13L)).thenReturn(true);

        service.delete(13L);

        verify(repository).deleteById(13L);
    }

    @Test
    void delete_shouldThrow_whenTaskMissing() {
        when(repository.existsById(1313L)).thenReturn(false);

        assertThrows(ResourceNotFoundException.class, () -> service.delete(1313L));
        verify(repository, never()).deleteById(anyLong());
    }

    @Test
    void delete_shouldCheckExistsBeforeDelete() {
        when(repository.existsById(14L)).thenReturn(true);

        service.delete(14L);

        verify(repository).existsById(14L);
        verify(repository).deleteById(14L);
    }

    @Test
    void create_shouldUseExpectedExistsEndpoint() {
        TaskDTO input = dto(15L, 150L, "Endpoint check", "PENDING");
        when(restTemplate.getForObject(anyString(), eq(Boolean.class))).thenReturn(true);
        when(repository.save(any(Task.class))).thenReturn(entity(15L, 150L, "Endpoint check", "PENDING"));

        service.create(input);

        verify(restTemplate).getForObject("http://Identity-Access-Management/internal/users/150/exists", Boolean.class);
    }

    @Test
    void create_shouldNotInvokeFindById() {
        TaskDTO input = dto(16L, 160L, "No findById", "PENDING");
        when(restTemplate.getForObject(anyString(), eq(Boolean.class))).thenReturn(true);
        when(repository.save(any(Task.class))).thenReturn(entity(16L, 160L, "No findById", "PENDING"));

        service.create(input);

        verify(repository, never()).findById(anyLong());
    }

    @Test
    void create_shouldNotInvokeFindAll() {
        TaskDTO input = dto(17L, 170L, "No findAll", "PENDING");
        when(restTemplate.getForObject(anyString(), eq(Boolean.class))).thenReturn(true);
        when(repository.save(any(Task.class))).thenReturn(entity(17L, 170L, "No findAll", "PENDING"));

        service.create(input);

        verify(repository, never()).findAll();
    }

    @Test
    void getAll_shouldCallRepositoryOnce() {
        when(repository.findAll()).thenReturn(List.of(entity(18L, 180L, "Once", "PENDING")));

        service.getAll();

        verify(repository, times(1)).findAll();
    }

    @Test
    void getById_shouldCallRepositoryOnce() {
        when(repository.findById(19L)).thenReturn(Optional.of(entity(19L, 190L, "Once", "PENDING")));

        service.getById(19L);

        verify(repository, times(1)).findById(19L);
    }

    @Test
    void delete_shouldNotCallFindById() {
        when(repository.existsById(20L)).thenReturn(true);

        service.delete(20L);

        verify(repository, never()).findById(anyLong());
    }

    @Test
    void getAll_shouldRetainRelatedEntityIds() {
        Task a = entity(21L, 210L, "Rel1", "PENDING");
        Task b = entity(22L, 220L, "Rel2", "PENDING");
        when(repository.findAll()).thenReturn(List.of(a, b));

        List<TaskDTO> result = service.getAll();

        assertEquals(3021L, result.get(0).getRelatedEntityID());
        assertEquals(3022L, result.get(1).getRelatedEntityID());
    }

    @Test
    void getById_shouldRetainRelatedEntityId() {
        when(repository.findById(23L)).thenReturn(Optional.of(entity(23L, 230L, "Rel single", "PENDING")));

        TaskDTO result = service.getById(23L);

        assertEquals(3023L, result.getRelatedEntityID());
    }

    @Test
    void create_shouldRetainInputStatus() {
        TaskDTO input = dto(24L, 240L, "Status retain", "CANCELLED");
        when(restTemplate.getForObject(anyString(), eq(Boolean.class))).thenReturn(true);
        when(repository.save(any(Task.class))).thenReturn(entity(24L, 240L, "Status retain", "CANCELLED"));

        TaskDTO result = service.create(input);

        assertEquals("CANCELLED", result.getStatus());
    }

    @Test
    void create_shouldRetainInputDueDate() {
        TaskDTO input = dto(25L, 250L, "Date retain", "PENDING");
        input.setDueDate(LocalDate.of(2027, 1, 5));
        Task saved = entity(25L, 250L, "Date retain", "PENDING");
        saved.setDueDate(LocalDate.of(2027, 1, 5));

        when(restTemplate.getForObject(anyString(), eq(Boolean.class))).thenReturn(true);
        when(repository.save(any(Task.class))).thenReturn(saved);

        TaskDTO result = service.create(input);

        assertEquals(LocalDate.of(2027, 1, 5), result.getDueDate());
    }

    @Test
    void create_shouldReturnDifferentIdsAcrossCalls() {
        TaskDTO first = dto(26L, 260L, "A", "PENDING");
        TaskDTO second = dto(27L, 270L, "B", "PENDING");

        when(restTemplate.getForObject(anyString(), eq(Boolean.class))).thenReturn(true);
        when(repository.save(any(Task.class)))
            .thenReturn(entity(26L, 260L, "A", "PENDING"))
            .thenReturn(entity(27L, 270L, "B", "PENDING"));

        TaskDTO r1 = service.create(first);
        TaskDTO r2 = service.create(second);

        assertNotEquals(r1.getTaskID(), r2.getTaskID());
    }

    @Test
    void create_shouldRejectDifferentMissingUser() {
        TaskDTO input = dto(28L, 280L, "Missing user", "PENDING");
        when(restTemplate.getForObject(anyString(), eq(Boolean.class))).thenReturn(false);

        assertThrows(ResourceNotFoundException.class, () -> service.create(input));
        verify(repository, never()).save(any());
    }

    @Test
    void getById_shouldMapCompletedStatus() {
        when(repository.findById(29L)).thenReturn(Optional.of(entity(29L, 290L, "Done", "COMPLETED")));

        TaskDTO result = service.getById(29L);

        assertEquals("COMPLETED", result.getStatus());
    }

    @Test
    void getById_shouldMapCancelledStatus() {
        when(repository.findById(30L)).thenReturn(Optional.of(entity(30L, 300L, "No longer needed", "CANCELLED")));

        TaskDTO result = service.getById(30L);

        assertEquals("CANCELLED", result.getStatus());
    }

    @Test
    void delete_shouldCallExistsOnce() {
        when(repository.existsById(31L)).thenReturn(true);

        service.delete(31L);

        verify(repository, times(1)).existsById(31L);
    }

    @Test
    void create_shouldCallSaveOnce() {
        TaskDTO input = dto(32L, 320L, "Save once", "PENDING");
        when(restTemplate.getForObject(anyString(), eq(Boolean.class))).thenReturn(true);
        when(repository.save(any(Task.class))).thenReturn(entity(32L, 320L, "Save once", "PENDING"));

        service.create(input);

        verify(repository, times(1)).save(any(Task.class));
    }

    @Test
    void getAll_shouldMapDescriptionsWithoutMutation() {
        Task a = entity(33L, 330L, "Keep A", "PENDING");
        Task b = entity(34L, 340L, "Keep B", "PENDING");
        when(repository.findAll()).thenReturn(List.of(a, b));

        List<TaskDTO> result = service.getAll();

        assertEquals("Keep A", result.get(0).getDescription());
        assertEquals("Keep B", result.get(1).getDescription());
    }

    @Test
    void getAll_shouldMapAssignedUsersInOrder() {
        Task a = entity(35L, 350L, "User order 1", "PENDING");
        Task b = entity(36L, 360L, "User order 2", "PENDING");
        when(repository.findAll()).thenReturn(List.of(a, b));

        List<TaskDTO> result = service.getAll();

        assertEquals(350L, result.get(0).getAssignedTo());
        assertEquals(360L, result.get(1).getAssignedTo());
    }

    @Test
    void getById_shouldMapDescriptionExactly() {
        when(repository.findById(37L)).thenReturn(Optional.of(entity(37L, 370L, "Exact description value", "PENDING")));

        TaskDTO result = service.getById(37L);

        assertEquals("Exact description value", result.getDescription());
    }

    @Test
    void create_shouldAcceptLongDescription() {
        String longText = "Prepare shipment docs, verify consignee data, validate load sequence";
        TaskDTO input = dto(38L, 380L, longText, "PENDING");
        when(restTemplate.getForObject(anyString(), eq(Boolean.class))).thenReturn(true);
        when(repository.save(any(Task.class))).thenReturn(entity(38L, 380L, longText, "PENDING"));

        TaskDTO result = service.create(input);

        assertEquals(longText, result.getDescription());
    }

    @Test
    void create_shouldAcceptFutureDueDate() {
        TaskDTO input = dto(39L, 390L, "Future date", "PENDING");
        input.setDueDate(LocalDate.of(2030, 12, 31));
        Task saved = entity(39L, 390L, "Future date", "PENDING");
        saved.setDueDate(LocalDate.of(2030, 12, 31));

        when(restTemplate.getForObject(anyString(), eq(Boolean.class))).thenReturn(true);
        when(repository.save(any(Task.class))).thenReturn(saved);

        TaskDTO result = service.create(input);

        assertEquals(LocalDate.of(2030, 12, 31), result.getDueDate());
    }

    @Test
    void getById_shouldMapPendingStatus() {
        when(repository.findById(40L)).thenReturn(Optional.of(entity(40L, 400L, "Pending item", "PENDING")));

        TaskDTO result = service.getById(40L);

        assertEquals("PENDING", result.getStatus());
    }
}
