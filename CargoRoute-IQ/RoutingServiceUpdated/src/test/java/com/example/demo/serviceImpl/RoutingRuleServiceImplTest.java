package com.example.demo.serviceImpl;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.example.demo.dto.RoutingRuleDTO;
import com.example.demo.entity.RoutingRule;
import com.example.demo.repository.RoutingRuleRepository;

@ExtendWith(MockitoExtension.class)
class RoutingRuleServiceImplTest {

    @Mock
    private RoutingRuleRepository ruleRepository;

    @InjectMocks
    private RoutingRuleServiceImpl ruleService;

    @Test
    void shouldCreateRuleAndReturnDto() {
        RoutingRuleDTO dto = new RoutingRuleDTO();
        dto.setName("Priority Pharma");
        dto.setConditionsJSON("{\"origin\":\"A\",\"destination\":\"B\"}");
        dto.setPriority(1);
        dto.setActive(true);

        when(ruleRepository.save(any(RoutingRule.class))).thenAnswer(invocation -> {
            RoutingRule rule = invocation.getArgument(0);
            rule.setRuleID(11L);
            return rule;
        });

        RoutingRuleDTO result = ruleService.createRule(dto);

        assertNotNull(result);
        assertEquals(11L, result.getRuleID());
        assertEquals("Priority Pharma", result.getName());
        assertTrue(result.getActive());
        verify(ruleRepository, times(1)).save(any(RoutingRule.class));
    }

    @Test
    void shouldGetRuleByIdAndReturnDto() {
        RoutingRule rule = new RoutingRule();
        rule.setRuleID(12L);
        rule.setName("Temperature Sensitive");
        rule.setConditionsJSON("{\"temperature\":\"cold\"}");
        rule.setPriority(2);
        rule.setActive(true);

        when(ruleRepository.findById(12L)).thenReturn(Optional.of(rule));

        RoutingRuleDTO result = ruleService.getRuleById(12L);

        assertNotNull(result);
        assertEquals(12L, result.getRuleID());
        assertEquals("Temperature Sensitive", result.getName());
    }

    @Test
    void shouldUpdateRuleAndReturnUpdatedDto() {
        RoutingRule existing = new RoutingRule();
        existing.setRuleID(13L);
        existing.setName("Standard Route");
        existing.setConditionsJSON("{\"origin\":\"C\"}");
        existing.setPriority(5);
        existing.setActive(false);

        RoutingRuleDTO updateDto = new RoutingRuleDTO();
        updateDto.setName("Updated Standard Route");
        updateDto.setConditionsJSON("{\"origin\":\"D\"}");
        updateDto.setPriority(6);
        updateDto.setActive(true);

        when(ruleRepository.findById(13L)).thenReturn(Optional.of(existing));
        when(ruleRepository.save(any(RoutingRule.class))).thenAnswer(invocation -> invocation.getArgument(0));

        RoutingRuleDTO result = ruleService.updateRule(13L, updateDto);

        assertNotNull(result);
        assertEquals("Updated Standard Route", result.getName());
        assertEquals(6, result.getPriority());
        assertTrue(result.getActive());
    }

    @Test
    void shouldReturnActiveRules() {
        RoutingRule activeRule = new RoutingRule();
        activeRule.setRuleID(14L);
        activeRule.setName("Active Rule");
        activeRule.setConditionsJSON("{}" );
        activeRule.setPriority(1);
        activeRule.setActive(true);

        when(ruleRepository.findByActiveTrue()).thenReturn(List.of(activeRule));

        List<RoutingRuleDTO> result = ruleService.getActiveRules();

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals(14L, result.get(0).getRuleID());
        assertTrue(result.get(0).getActive());
        verify(ruleRepository, times(1)).findByActiveTrue();
    }
}
