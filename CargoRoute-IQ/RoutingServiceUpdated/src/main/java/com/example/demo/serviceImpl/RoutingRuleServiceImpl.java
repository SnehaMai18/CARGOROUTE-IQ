package com.example.demo.serviceImpl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.dto.RoutingRuleDTO;
import com.example.demo.entity.RoutingRule;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.repository.RoutingRuleRepository;
import com.example.demo.service.RoutingRuleService;

@Service
public class RoutingRuleServiceImpl implements RoutingRuleService {

    @Autowired
    private RoutingRuleRepository ruleRepository;

    @Override
    public RoutingRuleDTO getRuleById(Long id) {
        RoutingRule rule = ruleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("RoutingRule not found with id: " + id));
        return entityToDto(rule);
    }

    @Override
    public List<RoutingRuleDTO> getAllRules() {
        return ruleRepository.findAll()
                .stream()
                .map(this::entityToDto)
                .collect(Collectors.toList());
    }

    @Override
    public RoutingRuleDTO createRule(RoutingRuleDTO ruleDTO) {
        RoutingRule rule = dtoToEntity(ruleDTO);
        RoutingRule saved = ruleRepository.save(rule);
        return entityToDto(saved);
    }

    @Override
    public RoutingRuleDTO updateRule(Long id, RoutingRuleDTO ruleDTO) {
        RoutingRule existing = ruleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("RoutingRule not found with id: " + id));

        existing.setName(ruleDTO.getName());
        existing.setConditionsJSON(ruleDTO.getConditionsJSON());
        existing.setPriority(ruleDTO.getPriority());
        existing.setActive(ruleDTO.getActive());

        RoutingRule updated = ruleRepository.save(existing);
        return entityToDto(updated);
    }

    @Override
    public void deleteRule(Long id) {
        RoutingRule existing = ruleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("RoutingRule not found with id: " + id));
        ruleRepository.delete(existing);
    }

    @Override
    public List<RoutingRuleDTO> getActiveRules() {
        return ruleRepository.findByActiveTrue()
                .stream()
                .map(this::entityToDto)
                .collect(Collectors.toList());
    }

    // Mapping methods
    private RoutingRuleDTO entityToDto(RoutingRule rule) {
        RoutingRuleDTO dto = new RoutingRuleDTO();
        dto.setRuleID(rule.getRuleID());
        dto.setName(rule.getName());
        dto.setConditionsJSON(rule.getConditionsJSON());
        dto.setPriority(rule.getPriority());
        dto.setActive(rule.getActive());
        return dto;
    }

    private RoutingRule dtoToEntity(RoutingRuleDTO dto) {
        RoutingRule rule = new RoutingRule();
        rule.setRuleID(dto.getRuleID());
        rule.setName(dto.getName());
        rule.setConditionsJSON(dto.getConditionsJSON());
        rule.setPriority(dto.getPriority());
        rule.setActive(dto.getActive());
        return rule;
    }
}