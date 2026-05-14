package com.example.demo.clients;

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

import com.example.demo.dto.NotificationDTO;
import jakarta.servlet.http.HttpServletRequest;

@Component
public class NotificationClient {

    private static final Logger logger = LoggerFactory.getLogger(NotificationClient.class);

    private final RestTemplate restTemplate;

    public NotificationClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public void notifyUser(Long userId, Long entityId, String message, String category) {
        if (userId == null || entityId == null) {
            return;
        }

        NotificationDTO dto = new NotificationDTO();
        dto.setUserID(userId);
        dto.setEntityID(entityId);
        dto.setMessage(message);
        dto.setCategory(category);

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            String auth = resolveAuthorizationHeader();
            if (auth != null) headers.set("Authorization", auth);
            restTemplate.postForObject(
                    "http://NOTIFICATIONS-AND-TASK-LISTS/cargoRoute/internal/notifications/create",
                    new HttpEntity<>(dto, headers),
                    NotificationDTO.class
            );
            logSmsPlaceholder(userId, message);
            logEmailPlaceholder(userId, message);
        } catch (Exception ex) {
            logger.warn("Notification publish failed for userId={}, entityId={}", userId, entityId, ex);
        }
    }

    private String resolveAuthorizationHeader() {
        RequestAttributes ra = RequestContextHolder.getRequestAttributes();
        if (ra instanceof ServletRequestAttributes sra) {
            return sra.getRequest().getHeader("Authorization");
        }
        return null;
    }

    private void logSmsPlaceholder(Long userId, String message) {
        logger.info("SMS placeholder: userId={}, message={}", userId, message);
    }

    private void logEmailPlaceholder(Long userId, String message) {
        logger.info("Email placeholder: userId={}, message={}", userId, message);
    }
}
