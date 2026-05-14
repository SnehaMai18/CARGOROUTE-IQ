package com.example.demo.controllers;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.demo.DTO.NotificationDTO;
import com.example.demo.services.NotificationService;

@RestController
@RequestMapping("/cargoRoute/internal/notifications")
public class InternalNotificationController {

    private final NotificationService notificationService;

    public InternalNotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @PostMapping("/create")
    public ResponseEntity<NotificationDTO> createInternal(@RequestBody NotificationDTO dto) {
        return new ResponseEntity<>(notificationService.create(dto), HttpStatus.CREATED);
    }
}
