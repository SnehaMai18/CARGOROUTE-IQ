package com.example.demo.serviceImpl;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.example.demo.dto.RevenueReportRequestDTO;
import com.example.demo.dto.RevenueReportResponseDTO;
import com.example.demo.dto.client.InvoiceClientDTO;
import com.example.demo.dto.client.InvoiceResponseClientDTO;
import com.example.demo.dto.client.RouteResponseClientDTO;
import com.example.demo.entity.Report;
import com.example.demo.enums.ReportScope;
import com.example.demo.repo.ReportRepo;
import com.example.demo.service.RevenueReportService;

@Service
public class RevenueReportServiceImpl implements RevenueReportService {

    // Direct ports — no Eureka dependency
    private static final String BILLING_BASE = "http://localhost:9098";
    private static final String ROUTING_BASE  = "http://localhost:8085";

    private final RestTemplate directRestTemplate = new RestTemplate();

    @Autowired
    private ReportRepo reportRepo;

    @Override
    public RevenueReportResponseDTO generateRevenueReport(
            RevenueReportRequestDTO request, String userName, String userRole) {

        LocalDate from = LocalDate.parse(request.getDateFrom());
        LocalDate to   = LocalDate.parse(request.getDateTo());

        // ── 1. Fetch all invoices from BillingService ─────────────────────────
        InvoiceResponseClientDTO[] invoiceResponseArray = new InvoiceResponseClientDTO[0];
        try {
            invoiceResponseArray = directRestTemplate.getForObject(
                    BILLING_BASE + "/cargoRoute/invoices/getAll",
                    InvoiceResponseClientDTO[].class);
        } catch (Exception e) {
            // BillingService unavailable — proceed with zero revenue
        }

        // Unwrap invoice from each wrapper and filter by issuedAt date range
        List<InvoiceClientDTO> rangedInvoices = invoiceResponseArray != null
                ? Arrays.stream(invoiceResponseArray)
                        .filter(r -> r != null && r.getInvoice() != null)
                        .map(InvoiceResponseClientDTO::getInvoice)
                        .filter(inv -> {
                            if (inv.getIssuedAt() == null) return false;
                            LocalDate d = inv.getIssuedAt().toLocalDate();
                            return !d.isBefore(from) && !d.isAfter(to);
                        })
                        .collect(Collectors.toList())
                : List.of();

        int totalInvoices = rangedInvoices.size();

        // ── 2. totalRevenue = sum of Invoice.totalAmount ──────────────────────
        double totalRevenue = rangedInvoices.stream()
                .filter(inv -> inv.getTotalAmount() != null)
                .mapToDouble(InvoiceClientDTO::getTotalAmount)
                .sum();

        // ── 3. Fetch all routes from RoutingService ───────────────────────────
        RouteResponseClientDTO[] routeArray = new RouteResponseClientDTO[0];
        try {
            routeArray = directRestTemplate.getForObject(
                    ROUTING_BASE + "/routes",
                    RouteResponseClientDTO[].class);
        } catch (Exception e) {
            // RoutingService unavailable — distance will be 0
        }

        // ── 4. totalDistanceKm = sum of all route distances ───────────────────
        double totalDistanceKm = routeArray != null
                ? Arrays.stream(routeArray)
                        .filter(r -> r != null && r.getDistanceKm() != null)
                        .mapToDouble(RouteResponseClientDTO::getDistanceKm)
                        .sum()
                : 0.0;

        // ── 5. revenuePerKm = totalRevenue / totalDistanceKm ─────────────────
        double revenuePerKm = totalDistanceKm > 0
                ? totalRevenue / totalDistanceKm
                : 0.0;

        // ── 6. Build generatedBy ──────────────────────────────────────────────
        String generatedBy;
        if (userName != null && !userName.isBlank()) {
            String role = (userRole != null && !userRole.isBlank()) ? userRole : "User";
            generatedBy = userName + " (" + role + ")";
        } else {
            generatedBy = "Unknown User";
        }

        // ── 7. Build JSON strings ─────────────────────────────────────────────
        String parametersJSON = String.format(
                "{\"dateFrom\":\"%s\",\"dateTo\":\"%s\"}",
                request.getDateFrom(), request.getDateTo());

        String metricsJSON = String.format(
                "{\"totalRevenue\":%.2f,\"totalDistanceKm\":%.2f,\"revenuePerKm\":%.2f}",
                totalRevenue, totalDistanceKm, revenuePerKm);

        // ── 8. Build report URI ───────────────────────────────────────────────
        LocalDateTime now = LocalDateTime.now();
        String reportURI = String.format(
                "/cargoRoute/reports/revenue/%s-to-%s/generated-%s",
                request.getDateFrom(),
                request.getDateTo(),
                now.format(DateTimeFormatter.ofPattern("yyyyMMdd-HHmmss")));

        // ── 9. Persist Report entity ──────────────────────────────────────────
        Report report = new Report();
        report.setScope(ReportScope.REVENUE);
        report.setParametersJSON(parametersJSON);
        report.setMetricsJSON(metricsJSON);
        report.setGeneratedBy(generatedBy);
        report.setGeneratedAt(now);
       

        Report saved = reportRepo.save(report);

        // ── 10. Build and return response ─────────────────────────────────────
        RevenueReportResponseDTO response = new RevenueReportResponseDTO();
        response.setReportID(saved.getReportID());
        response.setScope(saved.getScope().name());
        response.setParametersJSON(saved.getParametersJSON());
        response.setMetricsJSON(saved.getMetricsJSON());
        response.setGeneratedBy(saved.getGeneratedBy());
        response.setGeneratedAt(saved.getGeneratedAt().toString());
        response.setTotalRevenue(totalRevenue);
        response.setTotalDistanceKm(totalDistanceKm);
        response.setRevenuePerKm(revenuePerKm);
        response.setTotalInvoices(totalInvoices);

        return response;
    }
}
