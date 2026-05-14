package com.example.demo.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.demo.dto.RoutingRuleDTO;
import com.example.demo.service.RoutingRuleService;

@RestController
@RequestMapping("/cargoRoute/routingRules")
public class RoutingRuleController {

    @Autowired
    private RoutingRuleService ruleService;

    @GetMapping("/getRoutingRule/{id}")
    public ResponseEntity<RoutingRuleDTO> getRuleById(@PathVariable Long id) {
        return ResponseEntity.ok(ruleService.getRuleById(id));
    }

    @GetMapping("/getAllRoutingRules")
    public ResponseEntity<List<RoutingRuleDTO>> getAllRules() {
        return ResponseEntity.ok(ruleService.getAllRules());
    }

    @PostMapping("/createNewRoutingRule")
    public ResponseEntity<Map<String, Object>> createRule(@RequestBody RoutingRuleDTO ruleDTO) {
        RoutingRuleDTO createdRule = ruleService.createRule(ruleDTO);
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Routing rule created successfully");
        response.put("data", createdRule);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/updateRoutingRule/{id}")
    public ResponseEntity<Map<String, Object>> updateRule(@PathVariable Long id, @RequestBody RoutingRuleDTO ruleDTO) {
        RoutingRuleDTO updatedRule = ruleService.updateRule(id, ruleDTO);
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Routing rule updated successfully with id: " + id);
        response.put("data", updatedRule);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/deleteRoutingRule/{id}")
    public ResponseEntity<Map<String, String>> deleteRule(@PathVariable Long id) {
        ruleService.deleteRule(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Routing rule deleted with id: " + id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/active")
    public ResponseEntity<List<RoutingRuleDTO>> getActiveRules() {
        return ResponseEntity.ok(ruleService.getActiveRules());
    }
}