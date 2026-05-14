package com.example.demo.DTO;

import java.time.LocalDate;

public class TaskDTO {

    private Long taskID;
    private Long assignedTo;
    private Long relatedEntityID;
    private String description;
    private LocalDate dueDate;
    private String status;

    public TaskDTO() {}
    
    // getters & setters
    
    

	public Long getTaskID() {
		return taskID;
	}

	public void setTaskID(Long taskID) {
		this.taskID = taskID;
	}

	public Long getAssignedTo() {
		return assignedTo;
	}

	public void setAssignedTo(Long assignedTo) {
		this.assignedTo = assignedTo;
	}

	public Long getRelatedEntityID() {
		return relatedEntityID;
	}

	public void setRelatedEntityID(Long relatedEntityID) {
		this.relatedEntityID = relatedEntityID;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public LocalDate getDueDate() {
		return dueDate;
	}

	public void setDueDate(LocalDate dueDate) {
		this.dueDate = dueDate;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

    
    
}