package com.example.demo.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.entities.Notification;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
	List<Notification> findByUserIDOrderByCreatedAtDesc(Long userID);
	Optional<Notification> findByNotificationIDAndUserID(Long notificationID, Long userID);
	void deleteByUserID(Long userID);
}