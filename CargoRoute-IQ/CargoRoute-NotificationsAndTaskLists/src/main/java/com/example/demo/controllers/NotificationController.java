package com.example.demo.controllers;

import java.util.List;
import java.util.Map;

import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import com.example.demo.DTO.NotificationDTO;
import com.example.demo.DTO.NotificationResponseDTO;
import com.example.demo.services.NotificationService;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/cargoRoute/notifications")
public class NotificationController {

    private final NotificationService service;

    public NotificationController(NotificationService service) {
        this.service = service;
    }

    @PostMapping("/create")
    public ResponseEntity<NotificationDTO> create(@RequestBody NotificationDTO dto) {
        return new ResponseEntity<>(service.create(dto), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<NotificationDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @GetMapping("/getAllNotifications")
    public ResponseEntity<List<NotificationDTO>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    // Aggregated response
    @GetMapping("/{id}/details")
    public ResponseEntity<NotificationResponseDTO> getDetails(@PathVariable Long id) {
        return ResponseEntity.ok(service.getNotificationWithUser(id));
    }

    @PreAuthorize("hasRole('Admin')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/my")
    public ResponseEntity<List<NotificationDTO>> getMyNotifications(
            HttpServletRequest request) {

        Long userId = resolveUserId(request);
        return ResponseEntity.ok(service.getByUserId(userId));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<NotificationDTO> markAsRead(@PathVariable Long id,
                                                      HttpServletRequest request) {
        Long userId = resolveUserId(request);
        return ResponseEntity.ok(service.markAsRead(id, userId));
    }

    @PutMapping("/my/read-all")
    public ResponseEntity<Map<String, Integer>> markAllAsRead(HttpServletRequest request) {
        Long userId = resolveUserId(request);
        int updated = service.markAllAsRead(userId);
        return ResponseEntity.ok(Map.of("updated", updated));
    }

    @DeleteMapping("/my")
    public ResponseEntity<Map<String, Integer>> clearMyNotifications(HttpServletRequest request) {
        Long userId = resolveUserId(request);
        int deleted = service.deleteAllForUser(userId);
        return ResponseEntity.ok(Map.of("deleted", deleted));
    }

    private Long resolveUserId(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing or invalid token");
        }
        return userId;
    }

}