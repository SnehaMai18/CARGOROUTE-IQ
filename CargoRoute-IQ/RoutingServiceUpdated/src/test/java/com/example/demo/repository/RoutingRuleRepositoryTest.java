package com.example.demo.repository;

import static org.junit.jupiter.api.Assertions.*;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import com.example.demo.entity.RoutingRule;

@DataJpaTest
class RoutingRuleRepositoryTest {

    @Autowired
    private RoutingRuleRepository ruleRepository;

    private RoutingRule rule;

    @BeforeEach
    void setUp() {
        rule = new RoutingRule();
        rule.setName("Priority Pharma");
        rule.setConditionsJSON("{\"origin\":\"A\",\"destination\":\"B\"}");
        rule.setPriority(1);
        rule.setActive(true);
    }

    @Test
    void testSaveRule_Success() {
        RoutingRule savedRule = ruleRepository.save(rule);

        assertNotNull(savedRule);
        assertNotNull(savedRule.getRuleID());
        assertEquals("Priority Pharma", savedRule.getName());
        assertEquals(1, savedRule.getPriority());
        assertTrue(savedRule.getActive());
    }

    @Test
    void testFindById_Success() {
        RoutingRule savedRule = ruleRepository.save(rule);

        Optional<RoutingRule> retrievedRule = ruleRepository.findById(savedRule.getRuleID());

        assertTrue(retrievedRule.isPresent());
        assertEquals("Priority Pharma", retrievedRule.get().getName());
        assertTrue(retrievedRule.get().getActive());
    }

    @Test
    void testFindById_NotFound() {
        Optional<RoutingRule> retrievedRule = ruleRepository.findById(9999L);

        assertFalse(retrievedRule.isPresent());
    }

    @Test
    void testFindByActiveTrue_Success() {
        RoutingRule activeRule1 = new RoutingRule();
        activeRule1.setName("Active Rule 1");
        activeRule1.setConditionsJSON("{}");
        activeRule1.setPriority(1);
        activeRule1.setActive(true);

        RoutingRule inactiveRule = new RoutingRule();
        inactiveRule.setName("Inactive Rule");
        inactiveRule.setConditionsJSON("{}");
        inactiveRule.setPriority(2);
        inactiveRule.setActive(false);

        ruleRepository.save(rule);
        ruleRepository.save(activeRule1);
        ruleRepository.save(inactiveRule);

        List<RoutingRule> activeRules = ruleRepository.findByActiveTrue();

        assertEquals(2, activeRules.size());
        assertTrue(activeRules.stream().allMatch(RoutingRule::getActive));
    }

    @Test
    void testFindByActiveTrue_NoResults() {
        RoutingRule inactiveRule = new RoutingRule();
        inactiveRule.setName("Inactive Rule");
        inactiveRule.setConditionsJSON("{}");
        inactiveRule.setPriority(1);
        inactiveRule.setActive(false);

        ruleRepository.save(inactiveRule);

        List<RoutingRule> activeRules = ruleRepository.findByActiveTrue();

        assertTrue(activeRules.isEmpty());
    }

    @Test
    void testFindAll_Success() {
        RoutingRule rule2 = new RoutingRule();
        rule2.setName("Temperature Sensitive");
        rule2.setConditionsJSON("{\"temperature\":\"cold\"}");
        rule2.setPriority(2);
        rule2.setActive(true);

        ruleRepository.save(rule);
        ruleRepository.save(rule2);

        List<RoutingRule> rules = ruleRepository.findAll();

        assertEquals(2, rules.size());
    }

    @Test
    void testFindAll_EmptyDatabase() {
        List<RoutingRule> rules = ruleRepository.findAll();

        assertTrue(rules.isEmpty());
    }

    @Test
    void testUpdateRule_Success() {
        RoutingRule savedRule = ruleRepository.save(rule);

        savedRule.setName("Updated Priority Pharma");
        savedRule.setPriority(2);
        savedRule.setActive(false);
        RoutingRule updatedRule = ruleRepository.save(savedRule);

        Optional<RoutingRule> retrievedRule = ruleRepository.findById(updatedRule.getRuleID());

        assertTrue(retrievedRule.isPresent());
        assertEquals("Updated Priority Pharma", retrievedRule.get().getName());
        assertEquals(2, retrievedRule.get().getPriority());
        assertFalse(retrievedRule.get().getActive());
    }

    @Test
    void testDeleteRule_Success() {
        RoutingRule savedRule = ruleRepository.save(rule);
        Long ruleId = savedRule.getRuleID();

        ruleRepository.deleteById(ruleId);

        Optional<RoutingRule> retrievedRule = ruleRepository.findById(ruleId);

        assertFalse(retrievedRule.isPresent());
    }

    @Test
    void testDeleteRule_NonExistent() {
        assertDoesNotThrow(() -> ruleRepository.deleteById(9999L));
    }

    @Test
    void testSaveRule_WithNullFields() {
        RoutingRule ruleWithNulls = new RoutingRule();
        ruleWithNulls.setName(null);
        ruleWithNulls.setConditionsJSON(null);
        ruleWithNulls.setPriority(1);
        ruleWithNulls.setActive(true);

        RoutingRule savedRule = ruleRepository.save(ruleWithNulls);

        assertNotNull(savedRule);
        assertNotNull(savedRule.getRuleID());
        assertNull(savedRule.getName());
    }

    @Test
    void testFindAll_VariousStatuses() {
        RoutingRule rule2 = new RoutingRule();
        rule2.setName("Rule 2");
        rule2.setConditionsJSON("{}");
        rule2.setPriority(5);
        rule2.setActive(false);

        RoutingRule rule3 = new RoutingRule();
        rule3.setName("Rule 3");
        rule3.setConditionsJSON("{}");
        rule3.setPriority(10);
        rule3.setActive(true);

        ruleRepository.save(rule);
        ruleRepository.save(rule2);
        ruleRepository.save(rule3);

        List<RoutingRule> allRules = ruleRepository.findAll();
        List<RoutingRule> activeRules = ruleRepository.findByActiveTrue();

        assertEquals(3, allRules.size());
        assertEquals(2, activeRules.size());
    }

    @Test
    void testUpdateRule_ToggleActive() {
        RoutingRule savedRule = ruleRepository.save(rule);

        // Toggle active status
        savedRule.setActive(!savedRule.getActive());
        RoutingRule updatedRule = ruleRepository.save(savedRule);

        Optional<RoutingRule> retrieved = ruleRepository.findById(updatedRule.getRuleID());

        assertTrue(retrieved.isPresent());
        assertFalse(retrieved.get().getActive());
    }

    @Test
    void testSaveRule_WithComplexJSON() {
        RoutingRule complexRule = new RoutingRule();
        complexRule.setName("Complex Route Rule");
        complexRule.setConditionsJSON("{\"origin\":\"New York\",\"destination\":\"Los Angeles\",\"temperature\":\"cold\",\"hazmat\":false,\"priority\":\"HIGH\"}");
        complexRule.setPriority(3);
        complexRule.setActive(true);

        RoutingRule savedRule = ruleRepository.save(complexRule);

        Optional<RoutingRule> retrievedRule = ruleRepository.findById(savedRule.getRuleID());

        assertTrue(retrievedRule.isPresent());
        assertTrue(retrievedRule.get().getConditionsJSON().contains("New York"));
        assertTrue(retrievedRule.get().getConditionsJSON().contains("Los Angeles"));
    }
}
