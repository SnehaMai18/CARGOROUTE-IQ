package com.example.demo.controller;



import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import com.example.demo.dto.RoutingRuleDTO;
import com.example.demo.service.RoutingRuleService;
import com.fasterxml.jackson.databind.ObjectMapper;

@WebMvcTest(RoutingRuleController.class)
@ExtendWith(MockitoExtension.class)
class RoutingRuleControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Mock
    private RoutingRuleService ruleService;

    @Autowired
    private ObjectMapper objectMapper;

    private RoutingRuleDTO ruleDTO;

    @BeforeEach
    void setUp() {
        ruleDTO = new RoutingRuleDTO();
        ruleDTO.setRuleID(11L);
        ruleDTO.setName("Priority Pharma");
        ruleDTO.setConditionsJSON("{\"origin\":\"A\",\"destination\":\"B\"}");
        ruleDTO.setPriority(1);
        ruleDTO.setActive(true);
    }

    @Test
    void testGetRuleById_Success() throws Exception {
        when(ruleService.getRuleById(11L)).thenReturn(ruleDTO);

        mockMvc.perform(get("/cargoRoute/routingRules/getRoutingRule/11")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ruleID").value(11L))
                .andExpect(jsonPath("$.name").value("Priority Pharma"))
                .andExpect(jsonPath("$.active").value(true));

        verify(ruleService, times(1)).getRuleById(11L);
    }

    @Test
    void testGetRuleById_NotFound() throws Exception {
        when(ruleService.getRuleById(999L)).thenReturn(null);

        mockMvc.perform(get("/cargoRoute/routingRules/getRoutingRule/999")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());

        verify(ruleService, times(1)).getRuleById(999L);
    }

    @Test
    void testGetAllRules_Success() throws Exception {
        RoutingRuleDTO rule2 = new RoutingRuleDTO();
        rule2.setRuleID(12L);
        rule2.setName("Temperature Sensitive");
        rule2.setActive(true);

        when(ruleService.getAllRules()).thenReturn(List.of(ruleDTO, rule2));

        mockMvc.perform(get("/cargoRoute/routingRules/getAllRoutingRules")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].ruleID").value(11L))
                .andExpect(jsonPath("$[1].ruleID").value(12L))
                .andExpect(jsonPath("$.length()").value(2));

        verify(ruleService, times(1)).getAllRules();
    }

    @Test
    void testGetAllRules_EmptyList() throws Exception {
        when(ruleService.getAllRules()).thenReturn(List.of());

        mockMvc.perform(get("/cargoRoute/routingRules/getAllRoutingRules")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));

        verify(ruleService, times(1)).getAllRules();
    }

    @Test
    void testCreateRule_Success() throws Exception {
        when(ruleService.createRule(any(RoutingRuleDTO.class))).thenReturn(ruleDTO);

        mockMvc.perform(post("/cargoRoute/routingRules/createNewRoutingRule")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(ruleDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ruleID").value(11L))
                .andExpect(jsonPath("$.name").value("Priority Pharma"));

        verify(ruleService, times(1)).createRule(any(RoutingRuleDTO.class));
    }

    @Test
    void testCreateRule_WithNullFields() throws Exception {
        RoutingRuleDTO invalidDTO = new RoutingRuleDTO();
        invalidDTO.setName(null);
        invalidDTO.setActive(true);

        when(ruleService.createRule(any(RoutingRuleDTO.class))).thenReturn(invalidDTO);

        mockMvc.perform(post("/cargoRoute/routingRules/createNewRoutingRule")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidDTO)))
                .andExpect(status().isOk());

        verify(ruleService, times(1)).createRule(any(RoutingRuleDTO.class));
    }

    @Test
    void testUpdateRule_Success() throws Exception {
        RoutingRuleDTO updateDTO = new RoutingRuleDTO();
        updateDTO.setName("Updated Priority Pharma");
        updateDTO.setPriority(2);

        RoutingRuleDTO updatedDTO = new RoutingRuleDTO();
        updatedDTO.setRuleID(11L);
        updatedDTO.setName("Updated Priority Pharma");
        updatedDTO.setPriority(2);
        updatedDTO.setActive(true);

        when(ruleService.updateRule(eq(11L), any(RoutingRuleDTO.class))).thenReturn(updatedDTO);

        mockMvc.perform(put("/cargoRoute/routingRules/updateRoutingRule/11")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ruleID").value(11L))
                .andExpect(jsonPath("$.name").value("Updated Priority Pharma"))
                .andExpect(jsonPath("$.priority").value(2));

        verify(ruleService, times(1)).updateRule(eq(11L), any(RoutingRuleDTO.class));
    }

    @Test
    void testDeleteRule_Success() throws Exception {
        doNothing().when(ruleService).deleteRule(11L);

        mockMvc.perform(delete("/cargoRoute/routingRules/deleteRoutingRule/11")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNoContent());

        verify(ruleService, times(1)).deleteRule(11L);
    }

    @Test
    void testDeleteRule_NonExistent() throws Exception {
        doNothing().when(ruleService).deleteRule(999L);

        mockMvc.perform(delete("/cargoRoute/routingRules/deleteRoutingRule/999")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNoContent());

        verify(ruleService, times(1)).deleteRule(999L);
    }

    @Test
    void testGetActiveRules_Success() throws Exception {
        when(ruleService.getActiveRules()).thenReturn(List.of(ruleDTO));

        mockMvc.perform(get("/cargoRoute/routingRules/active")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].ruleID").value(11L))
                .andExpect(jsonPath("$[0].active").value(true))
                .andExpect(jsonPath("$.length()").value(1));

        verify(ruleService, times(1)).getActiveRules();
    }

    @Test
    void testGetActiveRules_NoResults() throws Exception {
        when(ruleService.getActiveRules()).thenReturn(List.of());

        mockMvc.perform(get("/cargoRoute/routingRules/active")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));

        verify(ruleService, times(1)).getActiveRules();
    }
}
