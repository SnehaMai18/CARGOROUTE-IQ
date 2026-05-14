package com.example.demo.serviceImpl;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.example.demo.dto.UtilizationReportRequestDTO;
import com.example.demo.dto.UtilizationReportResponseDTO;
import com.example.demo.dto.client.LoadClientDTO;
import com.example.demo.dto.client.LoadResponseClientDTO;
import com.example.demo.dto.client.VehicleClientDTO;
import com.example.demo.entity.Report;
import com.example.demo.enums.ReportScope;
import com.example.demo.repo.ReportRepo;
import com.example.demo.service.UtilizationReportService;

@Service
public class UtilizationReportServiceImpl implements UtilizationReportService {

    // Direct ports — bypasses Eureka; works even if discovery is down
    private static final String FLEET_BASE   = "http://localhost:8083";
    private static final String ROUTING_BASE = "http://localhost:8085";

    // Non-load-balanced RestTemplate for direct port calls
    private final RestTemplate directRestTemplate = new RestTemplate();

    @Autowired
    private ReportRepo reportRepo;

    // ────────────────────────────────────────────────────────────────────────
    @Override
    public UtilizationReportResponseDTO generateUtilizationReport(
            UtilizationReportRequestDTO request, String userName, String userRole) {

        LocalDate from = LocalDate.parse(request.getDateFrom());
        LocalDate to   = LocalDate.parse(request.getDateTo());

        // ── 1. Fetch all vehicles from FleetService ──────────────────────────
        VehicleClientDTO[] vehicleArray = new VehicleClientDTO[0];
        try {
            vehicleArray = directRestTemplate.getForObject(
                    FLEET_BASE + "/vehicles",
                    VehicleClientDTO[].class);
        } catch (Exception e) {
            // FleetService unreachable — proceed with zero capacity
        }

        List<VehicleClientDTO> allVehicles = vehicleArray != null
                ? Arrays.asList(vehicleArray)
                : List.of();

        // ── 2. Total fleet capacity = sum of all vehicles' maxWeightKg ───────
        double totalFleetCapacityKg = allVehicles.stream()
                .filter(v -> v.getMaxWeightKg() != null)
                .mapToDouble(VehicleClientDTO::getMaxWeightKg)
                .sum();

        // ── 3. Fetch all loads from RoutingService ────────────────────────────
        //    GET /loads returns List<RequiredResponseDTO> → each has vehicle + loadDto
        LoadResponseClientDTO[] loadResponseArray = new LoadResponseClientDTO[0];
        try {
            loadResponseArray = directRestTemplate.getForObject(
                    ROUTING_BASE + "/loads",
                    LoadResponseClientDTO[].class);
        } catch (Exception e) {
            // RoutingService unreachable — proceed with zero usage
        }

        // Unwrap the loadDto from each response wrapper
        List<LoadClientDTO> allLoads = loadResponseArray != null
                ? Arrays.stream(loadResponseArray)
                        .filter(r -> r != null && r.getLoadDto() != null)
                        .map(LoadResponseClientDTO::getLoadDto)
                        .collect(Collectors.toList())
                : List.of();

        // ── 4. Filter loads where plannedStart falls within [from, to] ────────
        List<LoadClientDTO> rangedLoads = allLoads.stream()
                .filter(l -> {
                    if (l.getPlannedStart() == null) return false;
                    LocalDate d = l.getPlannedStart().toLocalDate();
                    return !d.isBefore(from) && !d.isAfter(to);
                })
                .collect(Collectors.toList());

        // ── 5. Used capacity = sum of totalWeightKg from filtered loads ───────
        double usedCapacityKg = rangedLoads.stream()
                .filter(l -> l.getTotalWeightKg() != null)
                .mapToDouble(LoadClientDTO::getTotalWeightKg)
                .sum();

        // ── 6. Fleet utilization % ────────────────────────────────────────────
        double utilizationPctValue = totalFleetCapacityKg > 0
                ? (usedCapacityKg / totalFleetCapacityKg) * 100.0
                : 0.0;
        String utilizationPct = String.format("%.2f%%", utilizationPctValue);

        // ── 7. Build generatedBy from headers ─────────────────────────────────
        String generatedBy;
        if (userName != null && !userName.isBlank()) {
            String role = (userRole != null && !userRole.isBlank()) ? userRole : "User";
            generatedBy = userName + " (" + role + ")";
        } else {
            generatedBy = "Unknown User";
        }

        // ── 8. Build JSON strings ─────────────────────────────────────────────
        String parametersJSON = String.format(
                "{\"dateFrom\":\"%s\",\"dateTo\":\"%s\"}",
                request.getDateFrom(), request.getDateTo());

        String metricsJSON = String.format(
                "{\"totalFleetCapacityKg\":%.2f,\"usedCapacityKg\":%.2f,\"fleetUtilizationPercentage\":%s}",
                totalFleetCapacityKg, usedCapacityKg, String.format("%.2f", utilizationPctValue));

        // ── 8. Save Report entity ──────────────────────────────────────────────
        LocalDateTime now = LocalDateTime.now();
        Report report = new Report();
        report.setScope(ReportScope.UTILIZATION);
        report.setParametersJSON(parametersJSON);
        report.setMetricsJSON(metricsJSON);
        report.setGeneratedBy(generatedBy);
        report.setGeneratedAt(now);

        Report saved = reportRepo.save(report);

        // ── 11. Build and return response ─────────────────────────────────────
        UtilizationReportResponseDTO response = new UtilizationReportResponseDTO();
        response.setReportID(saved.getReportID());
        response.setScope(saved.getScope().name());
        response.setParametersJSON(saved.getParametersJSON());
        response.setMetricsJSON(saved.getMetricsJSON());
        response.setGeneratedBy(saved.getGeneratedBy());
        response.setGeneratedAt(saved.getGeneratedAt().toString());
        response.setTotalFleetCapacityKg(totalFleetCapacityKg);
        response.setUsedCapacityKg(usedCapacityKg);
        response.setFleetUtilizationPercentage(utilizationPct);

        return response;
    }
}
