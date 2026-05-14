package com.example.demo.service;

import com.example.demo.dto.UtilizationReportRequestDTO;
import com.example.demo.dto.UtilizationReportResponseDTO;

public interface UtilizationReportService {

    /**
     * @param request   contains dateFrom and dateTo (from frontend date pickers)
     * @param userName  logged-in user's name from X-User-Name header (from JWT)
     * @param userRole  logged-in user's role from X-User-Role header (from JWT)
     */
    UtilizationReportResponseDTO generateUtilizationReport(
            UtilizationReportRequestDTO request, String userName, String userRole);
}
