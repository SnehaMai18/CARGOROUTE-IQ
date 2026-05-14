package com.example.demo.service;

import com.example.demo.dto.ExceptionReportRequestDTO;
import com.example.demo.dto.ExceptionReportResponseDTO;

public interface ExceptionReportService {
    ExceptionReportResponseDTO generateExceptionReport(
            ExceptionReportRequestDTO request,
            String userName,
            String userRole);
}
