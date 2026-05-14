package com.example.demo.service;

import com.example.demo.dto.OnTimeReportRequestDTO;
import com.example.demo.dto.OnTimeReportResponseDTO;

public interface OnTimeReportService {

    /**
     * @param request   contains dateFrom and dateTo (from frontend date pickers)
     * @param userName  logged-in user's name from X-User-Name header (from JWT)
     * @param userRole  logged-in user's role from X-User-Role header (from JWT)
     */
    OnTimeReportResponseDTO generateOnTimeReport(OnTimeReportRequestDTO request, String userName, String userRole);
}
