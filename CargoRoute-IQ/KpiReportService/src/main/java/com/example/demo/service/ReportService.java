package com.example.demo.service;

import java.util.List;

import com.example.demo.dto.ReportDTO;

public interface ReportService {

    ReportDTO save(ReportDTO report);

    List<ReportDTO> getAll();

    ReportDTO getById(Long id);

    ReportDTO update(Long id, ReportDTO report);

    void delete(Long id);
}