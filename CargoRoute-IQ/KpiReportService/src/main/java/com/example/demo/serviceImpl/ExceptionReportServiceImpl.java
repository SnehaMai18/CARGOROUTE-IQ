package com.example.demo.serviceImpl;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.example.demo.dto.ExceptionReportRequestDTO;
import com.example.demo.dto.ExceptionReportResponseDTO;
import com.example.demo.dto.client.ExceptionClientDTO;
import com.example.demo.dto.client.ExceptionResponseClientDTO;
import com.example.demo.entity.Report;
import com.example.demo.enums.ReportScope;
import com.example.demo.repo.ReportRepo;
import com.example.demo.service.ExceptionReportService;

@Service
public class ExceptionReportServiceImpl implements ExceptionReportService {

    // Direct ports — no Eureka dependency
    private static final String EXCEPTION_BASE = "http://EXCEPTION-SERVICE";
    private static final String BOOKING_BASE   = "http://BOOKING-SERVICE";

    private final RestTemplate directRestTemplate = new RestTemplate();

    @Autowired
    private ReportRepo reportRepo;

    @Override
    public ExceptionReportResponseDTO generateExceptionReport(
            ExceptionReportRequestDTO request, String userName, String userRole) {

        java.time.LocalDate from = java.time.LocalDate.parse(request.getDateFrom());
        java.time.LocalDate to   = java.time.LocalDate.parse(request.getDateTo());

        // ── 1. Fetch total bookings count from BookingService ─────────────────
        int totalBookings = 0;
        try {
            Object[] bookings = directRestTemplate.getForObject(
                    BOOKING_BASE + "/cargoRoute/booking/getBookings",
                    Object[].class);
            if (bookings != null) totalBookings = bookings.length;
        } catch (Exception e) {
            // BookingService unavailable — denominator stays 0
        }

        // ── 2. Fetch all exceptions from ExceptionService ─────────────────────
        ExceptionResponseClientDTO[] exceptionResponseArray = new ExceptionResponseClientDTO[0];
        try {
            exceptionResponseArray = directRestTemplate.getForObject(
                    EXCEPTION_BASE + "/cargoRoute/exception/getExceptions",
                    ExceptionResponseClientDTO[].class);
        } catch (Exception e) {
            // ExceptionService unavailable — proceed with zero exceptions
        }

        // Unwrap and filter by reportedAt date range
        List<ExceptionClientDTO> filteredExceptions = exceptionResponseArray != null
                ? Arrays.stream(exceptionResponseArray)
                        .filter(r -> r != null && r.getExceptiondto() != null)
                        .map(ExceptionResponseClientDTO::getExceptiondto)
                        .filter(ex -> {
                            if (ex.getReportedAt() == null) return false;
                            try {
                                java.time.LocalDate d = null;
                                Object raw = ex.getReportedAt();
                                if (raw instanceof java.util.List) {
                                    // Jackson deserializes LocalDateTime as [year, month, day, ...]
                                    @SuppressWarnings("unchecked")
                                    java.util.List<Integer> parts = (java.util.List<Integer>) raw;
                                    d = java.time.LocalDate.of(parts.get(0), parts.get(1), parts.get(2));
                                } else {
                                    // ISO string like "2026-04-21T10:31:30.973558"
                                    d = java.time.LocalDate.parse(raw.toString().substring(0, 10));
                                }
                                return d != null && !d.isBefore(from) && !d.isAfter(to);
                            } catch (Exception ignore) {
                                return false;
                            }
                        })
                        .collect(Collectors.toList())
                : List.of();

        int totalExceptions = filteredExceptions.size();

        // ── 3. exceptionRate = (totalExceptions / totalBookings) × 100 ────────
        double exceptionRate = totalBookings > 0
                ? Math.round(((double) totalExceptions / totalBookings) * 10000.0) / 100.0
                : 0.0;

        // ── 4. Build generatedBy ──────────────────────────────────────────────
        String generatedBy;
        if (userName != null && !userName.isBlank()) {
            String role = (userRole != null && !userRole.isBlank()) ? userRole : "User";
            generatedBy = userName + " (" + role + ")";
        } else {
            generatedBy = "Unknown User";
        }

        // ── 5. Build JSON strings ─────────────────────────────────────────────
        String parametersJSON = String.format(
                "{\"dateFrom\":\"%s\",\"dateTo\":\"%s\"}",
                request.getDateFrom(), request.getDateTo());

        String metricsJSON = String.format(
                "{\"totalBookings\":%d,\"totalExceptions\":%d,\"exceptionRate\":%.2f}",
                totalBookings, totalExceptions, exceptionRate);

        // ── 6. Persist Report entity ─────────────────────────────────────────
        Report report = new Report();
        report.setScope(ReportScope.EXCEPTIONS);
        report.setParametersJSON(parametersJSON);
        report.setMetricsJSON(metricsJSON);
        report.setGeneratedBy(generatedBy);
        report.setGeneratedAt(LocalDateTime.now());
        Report saved = reportRepo.save(report);

        // ── 7. Build response ─────────────────────────────────────────────────
        ExceptionReportResponseDTO response = new ExceptionReportResponseDTO();
        response.setReportID(saved.getReportID());
        response.setScope("EXCEPTIONS");
        response.setParametersJSON(parametersJSON);
        response.setMetricsJSON(metricsJSON);
        response.setGeneratedBy(generatedBy);
        response.setGeneratedAt(saved.getGeneratedAt().toString());
        response.setTotalBookings(totalBookings);
        response.setTotalExceptions(totalExceptions);
        response.setExceptionRate(exceptionRate);

        return response;
    }
}
