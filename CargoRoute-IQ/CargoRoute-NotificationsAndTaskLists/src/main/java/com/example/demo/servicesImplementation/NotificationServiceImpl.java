package com.example.demo.servicesImplementation;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.example.demo.DTO.*;
import com.example.demo.annotations.AuditableAction;
import com.example.demo.entities.Notification;
import com.example.demo.enums.AuditAction;
import com.example.demo.enums.AuditResourceType;
import com.example.demo.exceptions.ResourceNotFoundException;
import com.example.demo.repositories.NotificationRepository;
import com.example.demo.services.NotificationService;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;

@Service
public class NotificationServiceImpl implements NotificationService {

    private static final String USER_SERVICE = "Identity-Access-Management";

    private final NotificationRepository repo;
    private final RestTemplate restTemplate;

    public NotificationServiceImpl(NotificationRepository repo,
                                   RestTemplate restTemplate) {
        this.repo = repo;
        this.restTemplate = restTemplate;
    }

//    @CircuitBreaker(name = USER_SERVICE, fallbackMethod = "fallbackUser")
    @Override
    @AuditableAction(action = AuditAction.CREATE, resourceType = AuditResourceType.NOTIFICATION, details = "Notification created")
    public NotificationDTO create(NotificationDTO dto) {

    	boolean userExists = false;
    	try {
    	    Boolean exists = restTemplate.getForObject(
    	        "http://IDENTITY-ACCESS-MANAGEMENT/cargoRoute/internal/users/" 
    	        + dto.getUserID() + "/exists",
    	        Boolean.class
    	    );
    	    userExists = Boolean.TRUE.equals(exists);
    	} catch (Exception ex) {
    	    // IAM is optional for notifications
    	    userExists = true; // allow notification anyway
    	}

    	if (!userExists) {
    	    // log but DO NOT block
    	    System.out.println("Warning: notification user not verified, userId=" + dto.getUserID());
    	}


        // 2. Proceed only if user exists
        Notification n = new Notification();
        n.setUserID(dto.getUserID());
        n.setEntityID(dto.getEntityID());
        n.setMessage(dto.getMessage());
        n.setCategory(dto.getCategory());
        n.setStatus("UNREAD");
        System.out.println("Creating notification for user " + dto.getUserID());

        return mapToDTO(repo.save(n));
    }

    @Override
    public NotificationDTO getById(Long id) {
        return mapToDTO(repo.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Notification not found: " + id)));
    }
    
    @Override
    public List<NotificationDTO> getByUserId(Long userId) {
        return repo.findByUserIDOrderByCreatedAtDesc(userId)
                   .stream()
                   .map(this::mapToDTO)
                   .toList();
    }

    @Override
    public NotificationDTO markAsRead(Long notificationId, Long userId) {
        Notification notification = repo.findByNotificationIDAndUserID(notificationId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found: " + notificationId));

        notification.setStatus("READ");
        return mapToDTO(repo.save(notification));
    }

    @Override
    public int markAllAsRead(Long userId) {
        List<Notification> notifications = repo.findByUserIDOrderByCreatedAtDesc(userId);
        int updated = 0;

        for (Notification notification : notifications) {
            if (!"READ".equalsIgnoreCase(notification.getStatus())) {
                notification.setStatus("READ");
                updated++;
            }
        }

        if (!notifications.isEmpty()) {
            repo.saveAll(notifications);
        }

        return updated;
    }

    @Override
    public int deleteAllForUser(Long userId) {
        List<Notification> notifications = repo.findByUserIDOrderByCreatedAtDesc(userId);
        int deleted = notifications.size();
        if (deleted > 0) {
            repo.deleteByUserID(userId);
        }
        return deleted;
    }
    

    @Override
    public List<NotificationDTO> getAll() {

        List<NotificationDTO> list = new ArrayList<>();
        for (Notification n : repo.findAll()) {
            list.add(mapToDTO(n));
        }
        return list;
    }

    //  API COMPOSITION (LIKE RequiredResponseDto)
    @Override
    @CircuitBreaker(name = USER_SERVICE, fallbackMethod = "fallbackUser")
    public NotificationResponseDTO getNotificationWithUser(Long id) {

        NotificationDTO notification = getById(id);

        InternalUserDTO user = restTemplate.getForObject(
        	    "http://IDENTITY-ACCESS-MANAGEMENT/cargoRoute/internal/users/" + notification.getUserID(),
        	    InternalUserDTO.class
        	);

        NotificationResponseDTO response = new NotificationResponseDTO();
        response.setNotification(notification);
        response.setUser(user);
        return response;
    }

    // ✅ FALLBACK METHOD
    public NotificationResponseDTO fallbackUser(Long id, Exception ex) {

        NotificationResponseDTO response = new NotificationResponseDTO();
        response.setNotification(getById(id));
        response.setUser(null); // graceful degradation
        return response;
    }

    @Override
    @AuditableAction(action = AuditAction.DELETE, resourceType = AuditResourceType.NOTIFICATION, details = "Notification deleted", resourceIdArgIndex = 0)
    public void delete(Long id) {
        if (!repo.existsById(id)) {
            throw new ResourceNotFoundException("Notification not found: " + id);
        }
        repo.deleteById(id);
    }

    private NotificationDTO mapToDTO(Notification n) {

        NotificationDTO dto = new NotificationDTO();
        dto.setNotificationID(n.getNotificationID());
        dto.setUserID(n.getUserID());
        dto.setEntityID(n.getEntityID());
        dto.setMessage(n.getMessage());
        dto.setCategory(n.getCategory());
        dto.setStatus(n.getStatus());
        dto.setCreatedAt(n.getCreatedAt());

        return dto;
    }
}