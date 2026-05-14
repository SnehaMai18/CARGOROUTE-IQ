package com.example.demo.serviceImpl;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.example.demo.dto.KPIDTO;
import com.example.demo.dto.KpiComputeRequestDTO;
import com.example.demo.entity.KPI;
import com.example.demo.entity.Report;
import com.example.demo.enums.ReportScope;
import com.example.demo.exception.KPINotFoundException;
import com.example.demo.repo.KPIRepo;
import com.example.demo.repo.ReportRepo;

@ExtendWith(MockitoExtension.class)
public class KPIServiceimplTest {

    @Mock
    private KPIRepo repo;

    @Mock
    private ReportRepo reportRepo;

    @InjectMocks
    private KPIServiceimpl service;

    @BeforeEach
    void setUp() {
        // no-op (Mockito annotations handle init)
    }

    @Test
    void computeKpi_utilization_computesAverageAndSaves() {
        KpiComputeRequestDTO req = new KpiComputeRequestDTO();
        req.setName("Utilization");
        req.setTarget(90.0);
        req.setReportingPeriod("Monthly");

        // two reports with fleetUtilizationPercentage 70 and 80
        Report r1 = new Report();
        r1.setScope(ReportScope.UTILIZATION);
        r1.setMetricsJSON("{\"fleetUtilizationPercentage\":70}");
        r1.setGeneratedAt(LocalDateTime.now());

        Report r2 = new Report();
        r2.setScope(ReportScope.UTILIZATION);
        r2.setMetricsJSON("{\"fleetUtilizationPercentage\":80}");
        r2.setGeneratedAt(LocalDateTime.now());

        when(reportRepo.findByScopeAndGeneratedAtBetween(eq(ReportScope.UTILIZATION), any(), any()))
            .thenReturn(List.of(r1, r2));

        when(repo.findByName("Utilization")).thenReturn(Optional.empty());

        // capture saved KPI
        when(repo.save(any(KPI.class))).thenAnswer(inv -> {
            KPI k = inv.getArgument(0);
            k.setKPIID(123L);
            return k;
        });

        KPIDTO res = service.computeKpi(req);

        assertNotNull(res);
        assertEquals(123L, res.getKpiID());
        // average of 70 and 80 = 75.00
        assertEquals(75.0, res.getCurrentValue());
        verify(repo).save(any(KPI.class));
    }

    @Test
    void getAll_returnsMappedDtos() {
        KPI e = new KPI();
        e.setKPIID(5L);
        e.setName("OnTime");
        e.setTarget(95.0);
        e.setCurrentValue(92.5);
        when(repo.findAll()).thenReturn(List.of(e));

        var list = service.getAll();
        assertNotNull(list);
        assertEquals(1, list.size());
        KPIDTO dto = list.get(0);
        assertEquals(5L, dto.getKpiID());
        assertEquals("OnTime", dto.getName());
    }

    @Test
    void delete_nonExisting_throwsKPINotFoundException() {
        when(repo.existsById(999L)).thenReturn(false);
        assertThrows(KPINotFoundException.class, () -> service.delete(999L));
    }

    @Test
    void computeKpi_revenue_sumsRevenueAndCalculatesPercent() {
        KpiComputeRequestDTO req = new KpiComputeRequestDTO();
        req.setName("Revenue");
        req.setTarget(20000.0); // user target ignored for computation baseline
        req.setReportingPeriod("Monthly");

        Report r1 = new Report();
        r1.setScope(ReportScope.REVENUE);
        r1.setMetricsJSON("{\"totalRevenue\":5000}");
        r1.setGeneratedAt(LocalDateTime.now());

        Report r2 = new Report();
        r2.setScope(ReportScope.REVENUE);
        r2.setMetricsJSON("{\"totalRevenue\":3000}");
        r2.setGeneratedAt(LocalDateTime.now());

        when(reportRepo.findByScopeAndGeneratedAtBetween(eq(ReportScope.REVENUE), any(), any()))
            .thenReturn(List.of(r1, r2));

        when(repo.findByName("Revenue")).thenReturn(Optional.empty());

        when(repo.save(any(KPI.class))).thenAnswer(inv -> {
            KPI k = inv.getArgument(0);
            k.setKPIID(777L);
            return k;
        });

        KPIDTO out = service.computeKpi(req);
        // total revenue = 8000, baseline target = 20000 -> 40.0%
        assertEquals(777L, out.getKpiID());
        assertEquals(40.0, out.getCurrentValue());
    }
}
