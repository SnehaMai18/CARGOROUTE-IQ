package com.example.demo.entities;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long taskID;

    // IAM userId
    @Column(nullable = false)
    private Long assignedTo;

    // Shipment / Invoice / Route ID
    private Long relatedEntityID;

    private String description;

    private LocalDate dueDate;

    private String status; // PENDING / COMPLETED / CANCELLED

    public Task() {}

    // getters & setters
    public Long getTaskID() { return taskID; }
    public void setTaskID(Long taskID) { this.taskID = taskID; }

    public Long getAssignedTo() { return assignedTo; }
    public void setAssignedTo(Long assignedTo) { this.assignedTo = assignedTo; }

    public Long getRelatedEntityID() { return relatedEntityID; }
    public void setRelatedEntityID(Long relatedEntityID) { this.relatedEntityID = relatedEntityID; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}