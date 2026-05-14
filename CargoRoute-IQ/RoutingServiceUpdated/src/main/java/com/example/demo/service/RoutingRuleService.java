package com.example.demo.service;

import java.util.List;
import com.example.demo.dto.RoutingRuleDTO;

public interface RoutingRuleService {
    RoutingRuleDTO getRuleById(Long id);
    List<RoutingRuleDTO> getAllRules();
    RoutingRuleDTO createRule(RoutingRuleDTO ruleDTO);
    RoutingRuleDTO updateRule(Long id, RoutingRuleDTO ruleDTO);
    void deleteRule(Long id);

    List<RoutingRuleDTO> getActiveRules();
}