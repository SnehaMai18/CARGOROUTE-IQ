package com.example.demo.services;

import java.util.List;
import com.example.demo.DTO.TaskDTO;

public interface TaskService {

    TaskDTO create(TaskDTO dto);

    TaskDTO update(Long id, TaskDTO dto);

    List<TaskDTO> getAll();

    TaskDTO getById(Long id);

    void delete(Long id);
}