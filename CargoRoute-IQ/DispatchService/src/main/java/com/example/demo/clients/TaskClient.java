package com.example.demo.clients;

import java.time.LocalDate;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import com.example.demo.dto.TaskDTO;

@Component
public class TaskClient {

    private static final Logger logger = LoggerFactory.getLogger(TaskClient.class);

    private final RestTemplate restTemplate;
    private final String taskCreateUrl;

    public TaskClient(
            RestTemplate restTemplate,
            @Value("${task.create-url:http://NOTIFICATIONS-AND-TASK-LISTS/cargoRoute/tasks/create}")
            String taskCreateUrl
    ) {
        this.restTemplate = restTemplate;
        this.taskCreateUrl = taskCreateUrl;
    }

    public void createTask(
            Long assignedTo,
            Long relatedEntityId,
            String description,
            LocalDate dueDate
    ) {
        if (assignedTo == null || relatedEntityId == null) return;

        TaskDTO dto = new TaskDTO();
        dto.setAssignedTo(assignedTo);
        dto.setRelatedEntityID(relatedEntityId);
        dto.setDescription(description);
        dto.setDueDate(dueDate != null ? dueDate : LocalDate.now());
        dto.setStatus("PENDING");

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            restTemplate.postForObject(
                    taskCreateUrl,
                    new HttpEntity<>(dto, headers),
                    Void.class
            );
        } catch (Exception ex) {
            logger.warn(
                "Task publish failed: assignedTo={}, entityId={}",
                assignedTo, relatedEntityId, ex
            );
        }
    }
}