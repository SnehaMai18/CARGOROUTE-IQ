package com.example.demo.clients;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import com.example.demo.dto.AuditLogDTO;

@Component
public class AuditLogClient {

    private static final Logger logger = LoggerFactory.getLogger(AuditLogClient.class);

    private final RestTemplate restTemplate;
    private final String auditCreateUrl;

    public AuditLogClient(
            RestTemplate restTemplate,
            @Value("${audit.log.create-url:http://IDENTITY-ACCESS-MANAGEMENT/cargoRoute/internal/auditLogs/create}")
            String auditCreateUrl
    ) {
        this.restTemplate = restTemplate;
        this.auditCreateUrl = auditCreateUrl;
    }

    public void log(
            Long userId,
            String action,
            String resourceType,
            Long resourceId,
            String details
    ) {
        try {
            AuditLogDTO dto = new AuditLogDTO();
            dto.setUserID(userId != null ? userId : 0L);
            dto.setAction(action);
            dto.setResourceType(resourceType);
            dto.setResourceID(resourceId != null ? resourceId : 0L);
            dto.setDetails(details);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            restTemplate.postForObject(
                    auditCreateUrl,
                    new HttpEntity<>(dto, headers),
                    Void.class
            );

        } catch (Exception ex) {
            // ✅ Audit must never break business flow
            logger.warn(
                "Audit logging failed: action={}, resourceType={}, resourceId={}",
                action, resourceType, resourceId, ex
            );
        }
    }
}