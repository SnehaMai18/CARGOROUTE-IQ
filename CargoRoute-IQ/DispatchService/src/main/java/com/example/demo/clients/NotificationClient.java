package com.example.demo.clients;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import com.example.demo.dto.NotificationDTO;

@Component
public class NotificationClient {

    private static final Logger logger = LoggerFactory.getLogger(NotificationClient.class);

    private final RestTemplate restTemplate;
    private final String notificationCreateUrl;

    public NotificationClient(
            RestTemplate restTemplate,
            @Value("${notification.create-url:http://NOTIFICATIONS-AND-TASK-LISTS/cargoRoute/internal/notifications/create}")
            String notificationCreateUrl
    ) {
        this.restTemplate = restTemplate;
        this.notificationCreateUrl = notificationCreateUrl;
    }

    public void notifyUser(Long userId, Long entityId, String message, String category) {
        if (userId == null || entityId == null) return;

        NotificationDTO dto = new NotificationDTO();
        dto.setUserID(userId);
        dto.setEntityID(entityId);
        dto.setMessage(message);
        dto.setCategory(category);

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            // ✅ no response body expected
            restTemplate.postForObject(
                    notificationCreateUrl,
                    new HttpEntity<>(dto, headers),
                    Void.class
            );
        } catch (Exception ex) {
            logger.warn(
                "Notification publish failed: userId={}, entityId={}",
                userId, entityId, ex
            );
        }
    }
}