package com.example.demo.service;

import com.example.demo.dto.RevenueReportRequestDTO;
import com.example.demo.dto.RevenueReportResponseDTO;

public interface RevenueReportService {

    /**
     * @param request   contains dateFrom and dateTo (invoice issuedAt filter)
     * @param userName  from X-User-Name header
     * @param userRole  from X-User-Role header
     */
    RevenueReportResponseDTO generateRevenueReport(
            RevenueReportRequestDTO request, String userName, String userRole);
}
