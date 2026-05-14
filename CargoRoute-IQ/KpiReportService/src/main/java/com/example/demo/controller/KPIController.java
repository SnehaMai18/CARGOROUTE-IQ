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
 
import com.example.demo.dto.KPIDTO;

import com.example.demo.dto.KpiComputeRequestDTO;

import com.example.demo.service.KPIService;
 
import jakarta.validation.Valid;
 
@RestController

@RequestMapping("/cargoRoute/kpis")

public class KPIController {
 
    @Autowired

    private KPIService service;
 
    // ── CREATE KPI (manual) ──────────────────────────────────────────────

    @PostMapping("/create")

    public ResponseEntity<KPIDTO> create(@Valid @RequestBody KPIDTO kpiDTO) {

        return ResponseEntity.ok(service.save(kpiDTO));

    }
 
    // ── COMPUTE KPI (derive currentValue from report data + period) ──────

    /**

     * POST /cargoRoute/kpis/compute

     * Body: { "name": "Utilization", "target": 90, "reportingPeriod": "Monthly" }

     *

     * KPI names  : Utilization | OnTime | Revenue | Exceptions

     * Target opts: 90 | 95

     * Period opts : Monthly | Quarterly | Yearly

     */

    @PostMapping("/compute")

    public ResponseEntity<KPIDTO> compute(@RequestBody KpiComputeRequestDTO request) {

        return ResponseEntity.ok(service.computeKpi(request));

    }
 
    // ── GET DEFINITION for a KPI name ────────────────────────────────────

    /**

     * GET /cargoRoute/kpis/definition/Utilization

     * Returns the fixed definition string for the requested KPI name.

     */

    @GetMapping("/definition/{name}")

    public ResponseEntity<String> getDefinition(@PathVariable String name) {

        return ResponseEntity.ok(service.getDefinition(name));

    }
 
    // ── GET ALL ──────────────────────────────────────────────────────────

    @GetMapping("/getAll")

    public ResponseEntity<List<KPIDTO>> getAll() {

        return ResponseEntity.ok(service.getAll());

    }
 
    // ── GET TARGET OPTIONS ──────────────────────────────────────────────

    @GetMapping("/targets")

    public ResponseEntity<java.util.List<Double>> getTargets() {

        return ResponseEntity.ok(service.getTargetOptions());

    }
 
    // ── GET BY ID ────────────────────────────────────────────────────────

    @GetMapping("/getBy/{id}")

    public ResponseEntity<KPIDTO> getById(@PathVariable Long id) {

        return ResponseEntity.ok(service.getById(id));

    }
 
    // ── UPDATE ───────────────────────────────────────────────────────────

    @PutMapping("/update/{id}")

    public ResponseEntity<KPIDTO> update(@PathVariable Long id,

                                         @Valid @RequestBody KPIDTO kpiDTO) {

        return ResponseEntity.ok(service.update(id, kpiDTO));

    }
 
    // ── DELETE ───────────────────────────────────────────────────────────

    @DeleteMapping("delete/{id}")

    public ResponseEntity<String> delete(@PathVariable Long id) {

        service.delete(id);

        return ResponseEntity.ok("KPI deleted successfully");

    }
 
    // ── EXPORT CSV ───────────────────────────────────────────────────────

    @GetMapping("/export")

    public ResponseEntity<byte[]> exportKPIs() {

        return ResponseEntity.ok()

                .header("Content-Disposition", "attachment; filename=kpis.csv")

                .body(service.exportKPIs());

    }

}

 