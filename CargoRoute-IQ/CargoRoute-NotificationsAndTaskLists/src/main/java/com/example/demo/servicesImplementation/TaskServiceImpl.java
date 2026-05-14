package com.example.demo.servicesImplementation;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.example.demo.DTO.TaskDTO;
import com.example.demo.annotations.AuditableAction;
import com.example.demo.entities.Task;
import com.example.demo.enums.AuditAction;
import com.example.demo.enums.AuditResourceType;
import com.example.demo.exceptions.ResourceNotFoundException;
import com.example.demo.repositories.TaskRepository;
import com.example.demo.services.TaskService;

@Service
public class TaskServiceImpl implements TaskService {

    private static final String IAM_SERVICE = "Identity-Access-Management";

    private final TaskRepository repo;
    private final RestTemplate restTemplate;

    public TaskServiceImpl(TaskRepository repo, RestTemplate restTemplate) {
        this.repo = repo;
        this.restTemplate = restTemplate;
    }

    @Override
    @AuditableAction(action = AuditAction.CREATE, resourceType = AuditResourceType.TASK, details = "Task created")
    public TaskDTO create(TaskDTO dto) {

    	boolean userExists = false;
    	try {
    	    Boolean exists = restTemplate.getForObject(
    	        "http://IDENTITY-ACCESS-MANAGEMENT/cargoRoute/internal/users/" 
    	        + dto.getAssignedTo() + "/exists",
    	        Boolean.class
    	    );
    	    userExists = Boolean.TRUE.equals(exists);
    	} catch (Exception ex) {
    	    userExists = true; // allow task anyway
    	}

    	if (!userExists) {
    	    System.out.println("Warning: task user not verified, userId=" + dto.getAssignedTo());
    	}

        Task task = new Task();
        task.setAssignedTo(dto.getAssignedTo());
        task.setRelatedEntityID(dto.getRelatedEntityID());
        task.setDescription(dto.getDescription());
        task.setDueDate(dto.getDueDate());
        task.setStatus(dto.getStatus());
        
        System.out.println("Creating task for user " + dto.getAssignedTo());

        return mapToDTO(repo.save(task));
    }

    @Override
    @AuditableAction(action = AuditAction.UPDATE, resourceType = AuditResourceType.TASK, details = "Task updated", resourceIdArgIndex = 0)
    public TaskDTO update(Long id, TaskDTO dto) {
        Task task = repo.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + id));

        if (dto.getAssignedTo() != null) {
            Boolean exists = restTemplate.getForObject(
                "http://IDENTITY-ACCESS-MANAGEMENT/cargoRoute/internal/users/" + dto.getAssignedTo() + "/exists",
                Boolean.class
            );
            if (exists == null || !exists) {
                throw new ResourceNotFoundException("User not found with id: " + dto.getAssignedTo());
            }
            task.setAssignedTo(dto.getAssignedTo());
        }

        if (dto.getRelatedEntityID() != null) {
            task.setRelatedEntityID(dto.getRelatedEntityID());
        }
        if (dto.getDescription() != null) {
            task.setDescription(dto.getDescription());
        }
        if (dto.getDueDate() != null) {
            task.setDueDate(dto.getDueDate());
        }
        if (dto.getStatus() != null) {
            task.setStatus(dto.getStatus());
        }

        return mapToDTO(repo.save(task));
    }

    @Override
    public List<TaskDTO> getAll() {
        List<TaskDTO> list = new ArrayList<>();
        for (Task t : repo.findAll()) {
            list.add(mapToDTO(t));
        }
        return list;
    }

    @Override
    public TaskDTO getById(Long id) {
        return mapToDTO(repo.findById(id)
            .orElseThrow(() ->
                new ResourceNotFoundException("Task not found with id: " + id)));
    }

    @Override
    @AuditableAction(action = AuditAction.DELETE, resourceType = AuditResourceType.TASK, details = "Task deleted", resourceIdArgIndex = 0)
    public void delete(Long id) {
        if (!repo.existsById(id)) {
            throw new ResourceNotFoundException("Task not found with id: " + id);
        }
        repo.deleteById(id);
    }

    private TaskDTO mapToDTO(Task task) {
        TaskDTO dto = new TaskDTO();
        dto.setTaskID(task.getTaskID());
        dto.setAssignedTo(task.getAssignedTo());
        dto.setRelatedEntityID(task.getRelatedEntityID());
        dto.setDescription(task.getDescription());
        dto.setDueDate(task.getDueDate());
        dto.setStatus(task.getStatus());
        return dto;
    }
}