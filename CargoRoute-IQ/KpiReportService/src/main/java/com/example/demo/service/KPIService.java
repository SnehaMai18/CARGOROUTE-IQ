package com.example.demo.service;

import java.util.List;

import com.example.demo.dto.KPIDTO;
import com.example.demo.dto.KpiComputeRequestDTO;

public interface KPIService {
    KPIDTO save(KPIDTO kpi);
    List<KPIDTO> getAll();
    KPIDTO getById(Long id);
    KPIDTO update(Long id, KPIDTO kpi);
    void delete(Long id);
    byte[] exportKPIs();

    /**
     * Compute the currentValue for the requested KPI name + period,
     * persist the result, and return the saved KPIDTO.
     */
    KPIDTO computeKpi(KpiComputeRequestDTO request);

    /** Return fixed definition text for a given KPI name. */
    String getDefinition(String name);

    /** Return available target options (e.g., 90, 95) exposed to frontend */
    java.util.List<Double> getTargetOptions();
}
