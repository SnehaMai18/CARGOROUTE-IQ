package com.example.demo.serviceImpl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.OptionalDouble;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.dto.KPIDTO;
import com.example.demo.dto.KpiComputeRequestDTO;
import com.example.demo.entity.KPI;
import com.example.demo.entity.Report;
import com.example.demo.enums.ReportScope;
import com.example.demo.exception.KPINotFoundException;
import com.example.demo.repo.KPIRepo;
import com.example.demo.repo.ReportRepo;
import com.example.demo.service.KPIService;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class KPIServiceimpl implements KPIService {

    private static final Map<String, String> DEFINITIONS = Map.of(
        "Utilization", "Vehicle capacity usage efficiency during the reporting period.",
        "OnTime",      "Percentage of deliveries completed within committed time windows.",
        "Revenue",     "Total freight revenue generated during the reporting period.",
        "Exceptions",  "Number of operational issues recorded during the reporting period."
    );

    private static final Map<String, ReportScope> NAME_TO_SCOPE = Map.of(
        "Utilization", ReportScope.UTILIZATION,
        "OnTime",      ReportScope.ONTIME,
        "Revenue",     ReportScope.REVENUE,
        "Exceptions",  ReportScope.EXCEPTIONS
    );

    // Backend-defined targets per KPI (not user-selectable)
    private static final Map<String, Double> KPI_TARGETS = Map.of(
        "Utilization", 90.0,      // target 90% utilization
        "OnTime",      90.0,      // target 90% on-time delivery
        "Revenue",     20000.0,   // target ₹20,000 revenue baseline
        "Exceptions",  90.0       // target 90% low exception rate (max 10% exceptions)
    );

    // Additional target options exposed to frontend
    private static final java.util.List<Double> KPI_TARGET_OPTIONS = java.util.List.of(90.0, 95.0);

    @Autowired
    private KPIRepo repo;

    @Autowired
    private ReportRepo reportRepo;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private KPIDTO toDTO(KPI e) {
        if (e == null) return null;
        KPIDTO d = new KPIDTO();
        d.setKpiID(e.getKPIID());
        d.setName(e.getName());
        d.setDefinition(e.getDefinition());
        d.setTarget(e.getTarget());
        d.setCurrentValue(e.getCurrentValue());
        d.setReportingPeriod(e.getReportingPeriod());
        return d;
    }

    private KPI toEntity(KPIDTO d) {
        if (d == null) return null;
        KPI e = new KPI();
        e.setKPIID(d.getKpiID());
        e.setName(d.getName());
        e.setDefinition(d.getDefinition());
        e.setTarget(d.getTarget());
        e.setCurrentValue(d.getCurrentValue());
        e.setReportingPeriod(d.getReportingPeriod());
        return e;
    }

    private LocalDateTime periodStart(String period) {
        LocalDateTime now = LocalDateTime.now();
        if (period == null) return now.minusMonths(1);
        switch (period.trim().toLowerCase()) {
            case "quarterly": return now.minusMonths(3);
            case "yearly":    return now.minusYears(1);
            default:          return now.minusMonths(1);
        }
    }

    @SuppressWarnings("unchecked")
    private Double extractMetric(String metricsJSON, String key) {
        try {
            Map<String, Object> map = objectMapper.readValue(metricsJSON, Map.class);
            Object val = map.get(key);
            if (val instanceof Number) {
                return ((Number) val).doubleValue();
            }
        } catch (Exception ignored) {}
        return null;
    }

    @Override
    public KPIDTO save(KPIDTO kpi) {
        return toDTO(repo.save(toEntity(kpi)));
    }

    @Override
    public List<KPIDTO> getAll() {
        List<KPI> list = repo.findAll();
        System.out.println("[DEBUG] getAll() called. Found " + list.size() + " KPIs");
        // Return empty list instead of throwing exception
        return list.stream().map(this::toDTO).toList();
    }

    @Override
    public KPIDTO getById(Long id) {
        return toDTO(repo.findById(id)
            .orElseThrow(() -> new KPINotFoundException("KPI not found with id: " + id)));
    }

    @Override
    public KPIDTO update(Long id, KPIDTO kpi) {
        KPI e = repo.findById(id)
            .orElseThrow(() -> new KPINotFoundException("KPI not found with id: " + id));
        e.setName(kpi.getName());
        e.setDefinition(kpi.getDefinition());
        e.setTarget(kpi.getTarget());
        e.setCurrentValue(kpi.getCurrentValue());
        e.setReportingPeriod(kpi.getReportingPeriod());
        return toDTO(repo.save(e));
    }

    @Override
    public void delete(Long id) {
        if (!repo.existsById(id)) throw new KPINotFoundException("KPI not found with id: " + id);
        repo.deleteById(id);
    }

    @Override
    public byte[] exportKPIs() {
        StringBuilder csv = new StringBuilder("ID,Name,Definition,Target,Current Value,Reporting Period\n");
        for (KPI e : repo.findAll()) {
            csv.append(e.getKPIID()).append(",")
               .append(e.getName()).append(",")
               .append(e.getDefinition()).append(",")
               .append(e.getTarget()).append(",")
               .append(e.getCurrentValue()).append(",")
               .append(e.getReportingPeriod()).append("\n");
        }
        return csv.toString().getBytes();
    }

    @Override
    public String getDefinition(String name) {
        return DEFINITIONS.getOrDefault(name, "");
    }

    @Override
    public java.util.List<Double> getTargetOptions() {
        return KPI_TARGET_OPTIONS;
    }

    @Override
    @Transactional
    public KPIDTO computeKpi(KpiComputeRequestDTO request) {
        System.out.println("[DEBUG] computeKpi called with: " + request.getName() + ", target=" + request.getTarget() + ", period=" + request.getReportingPeriod());
        
        String kpiName = request.getName();
        String period  = request.getReportingPeriod() != null ? request.getReportingPeriod() : "Monthly";

        ReportScope scope = NAME_TO_SCOPE.get(kpiName);
        if (scope == null) {
            throw new IllegalArgumentException(
                "Unknown KPI name: " + kpiName + ". Use: Utilization | OnTime | Revenue | Exceptions");
        }

        // target stored = user's selected % goal (e.g. 90 or 95)
        double target = request.getTarget() != null ? request.getTarget() : KPI_TARGETS.getOrDefault(kpiName, 90.0);

        // For Revenue the currentValue computation needs a monetary baseline (₹20,000),
        // NOT the user's % target — otherwise the result comes out in rupees, not percent.
        double computationBaseline = kpiName.equals("Revenue")
                ? KPI_TARGETS.getOrDefault("Revenue", 20000.0)   // fixed monetary baseline
                : target;                                          // for others target is unused in computation

        String definition  = DEFINITIONS.getOrDefault(kpiName, "");
        LocalDateTime from = periodStart(period);
        LocalDateTime to   = LocalDateTime.now();

        List<Report> reports = reportRepo.findByScopeAndGeneratedAtBetween(scope, from, to);
        if (reports.isEmpty()) {
            System.out.println("[DEBUG] No reports found for scope " + scope + " in period. Trying all scope.");
            reports = reportRepo.findByScope(scope);
        }
        System.out.println("[DEBUG] Found " + reports.size() + " reports for KPI");

        double currentValue = computeCurrentValue(scope, reports, computationBaseline);
        System.out.println("[DEBUG] Computed currentValue=" + currentValue);

        // Always create a new KPI record so every computation is persisted as a separate entry.
        // Previously this used findByName() upsert which only kept ONE row per KPI name.
        KPI kpi = new KPI();
        kpi.setName(kpiName);
        kpi.setDefinition(definition);
        kpi.setTarget(target);
        kpi.setCurrentValue(currentValue);
        kpi.setReportingPeriod(period);

        KPI saved = repo.save(kpi);
        System.out.println("[DEBUG] KPI saved successfully. New ID=" + saved.getKPIID());
        
        return toDTO(saved);
    }

    private double computeCurrentValue(ReportScope scope, List<Report> reports, double target) {
        if (reports.isEmpty()) return 0.0;

        if (scope == ReportScope.UTILIZATION) {
            // Try fleetUtilizationPercentage first; fall back to legacy avgUtilization key
            OptionalDouble avg = reports.stream()
                .map(r -> {
                    Double v = extractMetric(r.getMetricsJSON(), "fleetUtilizationPercentage");
                    if (v != null) return v;
                    return extractMetric(r.getMetricsJSON(), "avgUtilization");
                })
                .filter(v -> v != null)
                .mapToDouble(Double::doubleValue)
                .average();
            return round2(avg.orElse(0.0));
        }

        if (scope == ReportScope.ONTIME) {
            // Prefer computing from raw counts for accuracy;
            // fall back to the stored percentage string (e.g. "85.50%")
            OptionalDouble avg = reports.stream()
                .map(r -> {
                    try {
                        @SuppressWarnings("unchecked")
                        Map<String, Object> map = objectMapper.readValue(r.getMetricsJSON(), Map.class);
                        // 1) Compute from raw booking counts
                        Object tb = map.get("totalBookings");
                        Object ob = map.get("onTimeBookings");
                        if (tb instanceof Number && ob instanceof Number) {
                            double total  = ((Number) tb).doubleValue();
                            double onTime = ((Number) ob).doubleValue();
                            if (total > 0) return round2(onTime / total * 100.0);
                        }
                        // 2) Numeric percentage field
                        Object pct = map.get("onTimePercentage");
                        if (pct instanceof Number) return ((Number) pct).doubleValue();
                        // 3) String percentage field e.g. "85.50%"
                        if (pct != null) {
                            String s = pct.toString().replace("%", "").trim();
                            if (!s.isEmpty()) return Double.parseDouble(s);
                        }
                    } catch (Exception ignored) {}
                    return null;
                })
                .filter(v -> v != null && v > 0)
                .mapToDouble(Double::doubleValue)
                .average();
            return round2(avg.orElse(0.0));
        }

        if (scope == ReportScope.REVENUE) {
            // Compute actual revenue and convert to achievement % against backend target
            double actualRevenue = reports.stream()
                .map(r -> extractMetric(r.getMetricsJSON(), "totalRevenue"))
                .filter(v -> v != null)
                .mapToDouble(Double::doubleValue)
                .sum();
            return target > 0 ? round2(actualRevenue / target * 100.0) : 0.0;
        }

        if (scope == ReportScope.EXCEPTIONS) {
            // Compute aggregate exception rate % across all reports
            double totalExceptions = 0;
            double totalBookings   = 0;
            for (Report r : reports) {
                Double exc = extractMetric(r.getMetricsJSON(), "totalExceptions");
                Double bkg = extractMetric(r.getMetricsJSON(), "totalBookings");
                if (exc != null && bkg != null && bkg > 0) {
                    totalExceptions += exc;
                    totalBookings   += bkg;
                } else {
                    // Fall back to stored exceptionRate field
                    Double rate = extractMetric(r.getMetricsJSON(), "exceptionRate");
                    if (rate != null && rate > 0) {
                        totalExceptions += rate;
                        totalBookings   += 100;
                    }
                }
            }
            return totalBookings > 0 ? round2(totalExceptions / totalBookings * 100.0) : 0.0;
        }

        return 0.0;
    }

    private double round2(double v) {
        return Math.round(v * 100.0) / 100.0;
    }
}