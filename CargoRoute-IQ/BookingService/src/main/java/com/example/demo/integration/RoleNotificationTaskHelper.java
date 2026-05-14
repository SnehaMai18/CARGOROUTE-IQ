package com.example.demo.integration;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import com.example.demo.dto.BookingDTO;
import com.example.demo.enums.NotificationCategory;
import com.example.demo.enums.TaskStatus;

import java.util.List;
import java.util.Map;

/**
 * Utility for sending notifications and tasks to all users of a given role.
 */
@Component
public class RoleNotificationTaskHelper {
    @Autowired
    private RestTemplate restTemplate;

    private static final String IAM_USERS_BY_ROLE_URL = "http://IDENTITY-ACCESS-MANAGEMENT/cargoRoute/internal/users/byRole/{role}";
    private static final String NOTIFICATION_CREATE_URL = "http://NOTIFICATIONS/cargoRoute/notifications/create";
    private static final String TASK_CREATE_URL = "http://NOTIFICATIONS/cargoRoute/tasks/create";

    public void notifyRole(NotificationCategory category, String message, Long entityId, String role) {
        List<Map<String, Object>> users = getUsersByRole(role);
        for (Map<String, Object> user : users) {
            Long userId = ((Number)user.get("userID")).longValue();
            sendNotification(userId, entityId, message, category);
        }
    }

    public void assignTaskToRole(String description, Long entityId, String role) {
        List<Map<String, Object>> users = getUsersByRole(role);
        for (Map<String, Object> user : users) {
            Long userId = ((Number)user.get("userID")).longValue();
            sendTask(userId, entityId, description);
        }
    }

    private List<Map<String, Object>> getUsersByRole(String role) {
        ResponseEntity<List> response = restTemplate.getForEntity(IAM_USERS_BY_ROLE_URL, List.class, role);
        return response.getBody();
    }

    private void sendNotification(Long userId, Long entityId, String message, NotificationCategory category) {
        Map<String, Object> payload = Map.of(
            "userID", userId,
            "entityID", entityId,
            "message", message,
            "category", category.name()
        );
        restTemplate.postForEntity(NOTIFICATION_CREATE_URL, payload, Void.class);
    }

    private void sendTask(Long userId, Long entityId, String description) {
        Map<String, Object> payload = Map.of(
            "assignedTo", userId,
            "relatedEntityID", entityId,
            "description", description,
            "status", "PENDING"
        );
        restTemplate.postForEntity(TASK_CREATE_URL, payload, Void.class);
    }
}
