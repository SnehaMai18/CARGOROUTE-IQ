package com.example.demo.services;

import java.util.List;
import com.example.demo.DTO.NotificationDTO;
import com.example.demo.DTO.NotificationResponseDTO;

public interface NotificationService {

    NotificationDTO create(NotificationDTO dto);

    NotificationDTO getById(Long id);

    List<NotificationDTO> getAll();

    NotificationResponseDTO getNotificationWithUser(Long id);

    void delete(Long id);
    List<NotificationDTO> getByUserId(Long userId);

    NotificationDTO markAsRead(Long notificationId, Long userId);

    int markAllAsRead(Long userId);

    int deleteAllForUser(Long userId);
}