package com.example.demo.controllers;

import java.util.List;

import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import com.example.demo.DTO.TaskDTO;
import com.example.demo.services.TaskService;

@RestController
@RequestMapping("/cargoRoute/tasks")
public class TaskController {

    private final TaskService service;

    public TaskController(TaskService service) {
        this.service = service;
    }

    @PostMapping("/create")
    public ResponseEntity<TaskDTO> create(@RequestBody TaskDTO dto) {
        return new ResponseEntity<>(service.create(dto), HttpStatus.CREATED);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<TaskDTO> update(@PathVariable Long id, @RequestBody TaskDTO dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @GetMapping("getAllTasks")
    public ResponseEntity<List<TaskDTO>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TaskDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}