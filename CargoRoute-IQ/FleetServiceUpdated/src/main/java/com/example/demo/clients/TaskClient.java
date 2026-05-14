package com.example.demo.clients;

import java.time.LocalDate;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import org.springframework.web.client.RestTemplate;

import com.example.demo.dto.TaskDTO;

import jakarta.servlet.http.HttpServletRequest;

@Component
public class TaskClient {

    private static final Logger logger = LoggerFactory.getLogger(TaskClient.class);

    private final RestTemplate restTemplate;

    public TaskClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public void createTask(Long assignedTo, Long relatedEntityId, String description, LocalDate dueDate) {
        if (assignedTo == null || relatedEntityId == null) {
            return;
        }

        TaskDTO dto = new TaskDTO();
        dto.setAssignedTo(assignedTo);
        dto.setRelatedEntityID(relatedEntityId);
        dto.setDescription(description);
        dto.setDueDate(dueDate == null ? LocalDate.now() : dueDate);
        dto.setStatus("PENDING");

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            String authorization = resolveAuthorizationHeader();
            if (authorization != null && !authorization.isBlank()) {
                headers.set("Authorization", authorization);
            }

            restTemplate.postForObject(
                    "http://NOTIFICATIONS-AND-TASK-LISTS/cargoRoute/tasks/create",
                    new HttpEntity<>(dto, headers),
                    TaskDTO.class
            );
        } catch (Exception ex) {
            logger.warn("Task publish failed for assignedTo={}, relatedEntityId={}", assignedTo, relatedEntityId, ex);
        }
    }

    private String resolveAuthorizationHeader() {
        RequestAttributes attributes = RequestContextHolder.getRequestAttributes();
        if (attributes instanceof ServletRequestAttributes servletAttributes) {
            HttpServletRequest request = servletAttributes.getRequest();
            return request.getHeader("Authorization");
        }
        return null;
    }
}
