package com.example.demo.controllers;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import com.example.demo.DTO.TaskDTO;
import com.example.demo.exceptions.ResourceNotFoundException;
import com.example.demo.services.TaskService;

@ExtendWith(MockitoExtension.class)
class TaskControllerTest {

    @Mock
    private TaskService taskService;

    private TaskController controller;

    @BeforeEach
    void setUp() {
        controller = new TaskController(taskService);
    }

    private TaskDTO taskDto(Long id, Long assignee, String status) {
        TaskDTO dto = new TaskDTO();
        dto.setTaskID(id);
        dto.setAssignedTo(assignee);
        dto.setRelatedEntityID(1000L + id);
        dto.setDescription("Task-" + id);
        dto.setDueDate(LocalDate.of(2026, 4, 14).plusDays(id));
        dto.setStatus(status);
        return dto;
    }

    @Test
    void create_shouldReturnCreatedTask() {
        TaskDTO input = taskDto(1L, 11L, "PENDING");
        when(taskService.create(input)).thenReturn(input);

        ResponseEntity<TaskDTO> response = controller.create(input);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertEquals(1L, response.getBody().getTaskID());
        verify(taskService).create(input);
    }

    @Test
    void create_shouldPropagateNotFoundFromService() {
        TaskDTO input = taskDto(2L, 22L, "PENDING");
        when(taskService.create(input)).thenThrow(new ResourceNotFoundException("User not found"));

        assertThrows(ResourceNotFoundException.class, () -> controller.create(input));
        verify(taskService).create(input);
    }

    @Test
    void getAll_shouldReturnTasks() {
        when(taskService.getAll()).thenReturn(List.of(taskDto(3L, 33L, "PENDING"), taskDto(4L, 44L, "COMPLETED")));

        ResponseEntity<List<TaskDTO>> response = controller.getAll();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(2, response.getBody().size());
        verify(taskService).getAll();
    }

    @Test
    void getAll_shouldReturnEmptyWhenServiceEmpty() {
        when(taskService.getAll()).thenReturn(Collections.emptyList());

        ResponseEntity<List<TaskDTO>> response = controller.getAll();

        assertTrue(response.getBody().isEmpty());
        verify(taskService).getAll();
    }

    @Test
    void getById_shouldReturnSingleTask() {
        when(taskService.getById(5L)).thenReturn(taskDto(5L, 55L, "PENDING"));

        ResponseEntity<TaskDTO> response = controller.getById(5L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(5L, response.getBody().getTaskID());
        verify(taskService).getById(5L);
    }

    @Test
    void getById_shouldPropagateNotFound() {
        when(taskService.getById(500L)).thenThrow(new ResourceNotFoundException("Task not found"));

        assertThrows(ResourceNotFoundException.class, () -> controller.getById(500L));
        verify(taskService).getById(500L);
    }

    @Test
    void delete_shouldReturnNoContent() {
        doNothing().when(taskService).delete(6L);

        ResponseEntity<Void> response = controller.delete(6L);

        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
        assertNull(response.getBody());
        verify(taskService).delete(6L);
    }

    @Test
    void delete_shouldPropagateNotFound() {
        doThrow(new ResourceNotFoundException("Missing task")).when(taskService).delete(600L);

        assertThrows(ResourceNotFoundException.class, () -> controller.delete(600L));
        verify(taskService).delete(600L);
    }

    @Test
    void create_shouldKeepDueDate() {
        TaskDTO input = taskDto(7L, 77L, "PENDING");
        when(taskService.create(input)).thenReturn(input);

        ResponseEntity<TaskDTO> response = controller.create(input);

        assertEquals(input.getDueDate(), response.getBody().getDueDate());
        verify(taskService).create(input);
    }

    @Test
    void create_shouldKeepDescription() {
        TaskDTO input = taskDto(8L, 88L, "PENDING");
        input.setDescription("Check cold-chain status");
        when(taskService.create(input)).thenReturn(input);

        ResponseEntity<TaskDTO> response = controller.create(input);

        assertEquals("Check cold-chain status", response.getBody().getDescription());
        verify(taskService).create(input);
    }

    @Test
    void getById_shouldReturnCompletedStatus() {
        TaskDTO dto = taskDto(9L, 99L, "COMPLETED");
        when(taskService.getById(9L)).thenReturn(dto);

        ResponseEntity<TaskDTO> response = controller.getById(9L);

        assertEquals("COMPLETED", response.getBody().getStatus());
        verify(taskService).getById(9L);
    }

    @Test
    void getById_shouldReturnAssignedUser() {
        TaskDTO dto = taskDto(10L, 1010L, "PENDING");
        when(taskService.getById(10L)).thenReturn(dto);

        ResponseEntity<TaskDTO> response = controller.getById(10L);

        assertEquals(1010L, response.getBody().getAssignedTo());
        verify(taskService).getById(10L);
    }

    @Test
    void getAll_shouldPreserveTaskOrder() {
        TaskDTO first = taskDto(11L, 111L, "PENDING");
        TaskDTO second = taskDto(12L, 122L, "CANCELLED");
        when(taskService.getAll()).thenReturn(List.of(first, second));

        ResponseEntity<List<TaskDTO>> response = controller.getAll();

        assertEquals(11L, response.getBody().get(0).getTaskID());
        assertEquals(12L, response.getBody().get(1).getTaskID());
        verify(taskService).getAll();
    }

    @Test
    void getAll_shouldReturnDistinctDescriptions() {
        TaskDTO one = taskDto(13L, 133L, "PENDING");
        one.setDescription("Load container");
        TaskDTO two = taskDto(14L, 144L, "PENDING");
        two.setDescription("Verify seal");
        when(taskService.getAll()).thenReturn(List.of(one, two));

        ResponseEntity<List<TaskDTO>> response = controller.getAll();

        assertNotEquals(response.getBody().get(0).getDescription(), response.getBody().get(1).getDescription());
        verify(taskService).getAll();
    }

    @Test
    void delete_shouldCallServiceExactlyOnce() {
        doNothing().when(taskService).delete(15L);

        controller.delete(15L);

        verify(taskService, times(1)).delete(15L);
    }

    @Test
    void create_shouldReturnSameBodyReference() {
        TaskDTO input = taskDto(16L, 166L, "PENDING");
        when(taskService.create(input)).thenReturn(input);

        ResponseEntity<TaskDTO> response = controller.create(input);

        assertSame(input, response.getBody());
        verify(taskService).create(input);
    }
}
