package com.example.demo.controller;
 
import java.util.List;
 
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.DeleteMapping;

import org.springframework.web.bind.annotation.GetMapping;

import org.springframework.web.bind.annotation.PathVariable;

import org.springframework.web.bind.annotation.PostMapping;

import org.springframework.web.bind.annotation.PutMapping;

import org.springframework.web.bind.annotation.RequestBody;

import org.springframework.web.bind.annotation.RequestMapping;

import org.springframework.web.bind.annotation.RestController;
 
import com.example.demo.dto.ReportDTO;

import com.example.demo.service.ReportService;
 
import com.example.demo.dto.OnTimeReportRequestDTO;

import com.example.demo.dto.OnTimeReportResponseDTO;

import com.example.demo.service.OnTimeReportService;
 
import com.example.demo.dto.UtilizationReportRequestDTO;

import com.example.demo.dto.UtilizationReportResponseDTO;

import com.example.demo.service.UtilizationReportService;
 
import com.example.demo.dto.RevenueReportRequestDTO;

import com.example.demo.dto.RevenueReportResponseDTO;

import com.example.demo.service.RevenueReportService;
 
import com.example.demo.dto.ExceptionReportRequestDTO;

import com.example.demo.dto.ExceptionReportResponseDTO;

import com.example.demo.service.ExceptionReportService;
 
import jakarta.validation.Valid;
 
@RestController

@RequestMapping("/cargoRoute/reports")

public class ReportController {
 
    @Autowired

    private ReportService service;
 
    @Autowired

    private OnTimeReportService onTimeReportService;
 
    @Autowired

    private UtilizationReportService utilizationReportService;
 
    @Autowired

    private RevenueReportService revenueReportService;
 
    @Autowired

    private ExceptionReportService exceptionReportService;
 
    // ================= GENERATE ON-TIME REPORT =================

    @PostMapping("/generate/ontime")

    public ResponseEntity<OnTimeReportResponseDTO> generateOnTime(

            @Valid @RequestBody OnTimeReportRequestDTO request,

            @org.springframework.web.bind.annotation.RequestHeader(value = "X-User-Name", required = false) String userName,

            @org.springframework.web.bind.annotation.RequestHeader(value = "X-User-Role", required = false) String userRole) {

        OnTimeReportResponseDTO result = onTimeReportService.generateOnTimeReport(request, userName, userRole);

        return ResponseEntity.ok(result);

    }
 
    // ================= GENERATE UTILIZATION REPORT =================

    @PostMapping("/generate/utilization")

    public ResponseEntity<UtilizationReportResponseDTO> generateUtilization(

            @Valid @RequestBody UtilizationReportRequestDTO request,

            @org.springframework.web.bind.annotation.RequestHeader(value = "X-User-Name", required = false) String userName,

            @org.springframework.web.bind.annotation.RequestHeader(value = "X-User-Role", required = false) String userRole) {

        UtilizationReportResponseDTO result = utilizationReportService.generateUtilizationReport(request, userName, userRole);

        return ResponseEntity.ok(result);

    }
 
    // ================= GENERATE REVENUE REPORT =================

    @PostMapping("/generate/revenue")

    public ResponseEntity<RevenueReportResponseDTO> generateRevenue(

            @Valid @RequestBody RevenueReportRequestDTO request,

            @org.springframework.web.bind.annotation.RequestHeader(value = "X-User-Name", required = false) String userName,

            @org.springframework.web.bind.annotation.RequestHeader(value = "X-User-Role", required = false) String userRole) {

        RevenueReportResponseDTO result = revenueReportService.generateRevenueReport(request, userName, userRole);

        return ResponseEntity.ok(result);

    }
 
    // ================= GENERATE EXCEPTIONS REPORT =================

    @PostMapping("/generate/exceptions")

    public ResponseEntity<ExceptionReportResponseDTO> generateExceptions(

            @Valid @RequestBody ExceptionReportRequestDTO request,

            @org.springframework.web.bind.annotation.RequestHeader(value = "X-User-Name", required = false) String userName,

            @org.springframework.web.bind.annotation.RequestHeader(value = "X-User-Role", required = false) String userRole) {

        ExceptionReportResponseDTO result = exceptionReportService.generateExceptionReport(request, userName, userRole);

        return ResponseEntity.ok(result);

    }
 
    // ================= CREATE REPORT =================

    @PostMapping("/create")

    public ResponseEntity<ReportDTO> create(@Valid @RequestBody ReportDTO reportDTO) {

        ReportDTO savedReport = service.save(reportDTO);

        return ResponseEntity.ok(savedReport);

    }
 
    // ================= GET ALL REPORTS =================

    @GetMapping("/getAll")

    public ResponseEntity<List<ReportDTO>> getAll() {

        List<ReportDTO> reports = service.getAll();

        return ResponseEntity.ok(reports);

    }
 
    // ================= GET REPORT BY ID =================

    @GetMapping("/getBy/{id}")

    public ResponseEntity<ReportDTO> getById(@PathVariable Long id) {

        ReportDTO report = service.getById(id);

        return ResponseEntity.ok(report);

    }
 
    // ================= UPDATE REPORT =================

    @PutMapping("/update/{id}")

    public ResponseEntity<ReportDTO> update(@PathVariable Long id, @Valid @RequestBody ReportDTO reportDTO) {

        ReportDTO updated = service.update(id, reportDTO);

        return ResponseEntity.ok(updated);

    }
 
    // ================= DELETE REPORT =================

    @DeleteMapping("delete/{id}")

    public ResponseEntity<String> delete(@PathVariable Long id) {

        service.delete(id);

        return ResponseEntity.ok("Report deleted successfully");

    }

}
 