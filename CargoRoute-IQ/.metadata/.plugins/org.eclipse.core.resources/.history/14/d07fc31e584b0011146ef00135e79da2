package com.example.demo.controller;


import com.example.demo.dto.DispatchDTO;
import com.example.demo.dto.DispatchResponseDTO;
import com.example.demo.entities.enums.DispatchStatus;
import com.example.demo.exception.GlobalExceptionHandler;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.service.DispatchService;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class DispatchControllerTest {

    private MockMvc mockMvc;

    @Mock
    private DispatchService dispatchService;

    @InjectMocks
    private DispatchController dispatchController;

    private ObjectMapper objectMapper;
    private DispatchDTO dispatchDTO;
    private DispatchResponseDTO responseDTO;

    @BeforeEach
    void setUp() {

        mockMvc = MockMvcBuilders.standaloneSetup(dispatchController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();

        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());

        dispatchDTO = new DispatchDTO();
        dispatchDTO.setDispatchID(1L);
        dispatchDTO.setLoadID(100L);
        dispatchDTO.setAssignedDriverID(200L);
        dispatchDTO.setAssignedBy("Admin");
        dispatchDTO.setAssignedAt(LocalDateTime.now());
        dispatchDTO.setStatus(DispatchStatus.ASSIGNED);

        responseDTO = new DispatchResponseDTO();
        responseDTO.setDispatch(dispatchDTO);
    }

    // CREATE
    @Test
    void createDispatch_ShouldReturn201_WhenCreated() throws Exception {

        mockMvc.perform(post("/cargoRoute/dispatches/createDispatch")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dispatchDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.message")
                        .value("Dispatch created successfully."));
    }

    // ✅ ✅ ✅ FIXED TEST ✅ ✅ ✅
    // GET DISPATCH BY LOAD ID (single object)
    @Test
    void getDispatchByLoadId_ShouldReturn200_WhenFound() throws Exception {

        when(dispatchService.findByLoadID(100L))
                .thenReturn(responseDTO);

        mockMvc.perform(get("/cargoRoute/dispatches/getDispatchByLoadId/100"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.dispatch.loadID").value(100))
                .andExpect(jsonPath("$.dispatch.assignedBy").value("Admin"));
    }

    // FETCH BY ID
    @Test
    void getDispatchById_ShouldReturn200_WhenFound() throws Exception {

        when(dispatchService.fetchByID(1L))
                .thenReturn(responseDTO);

        mockMvc.perform(get("/cargoRoute/dispatches/getDispatchById/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.dispatch.dispatchID").value(1))
                .andExpect(jsonPath("$.dispatch.status").value("ASSIGNED"));
    }

    @Test
    void getDispatchById_ShouldReturn404_WhenNotFound() throws Exception {

        when(dispatchService.fetchByID(99L))
                .thenThrow(new ResourceNotFoundException("Dispatch not found"));

        mockMvc.perform(get("/cargoRoute/dispatches/getDispatchById/99"))
                .andExpect(status().isNotFound());
    }

    // FETCH BY ASSIGNED BY
    @Test
    void getDispatchByAssignedBy_ShouldReturn200_WithList() throws Exception {

        when(dispatchService.fetchByAssignedBy("Admin"))
                .thenReturn(List.of(responseDTO));

        mockMvc.perform(get("/cargoRoute/dispatches/getAssigned-by/Admin"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].dispatch.assignedBy").value("Admin"));
    }

    // FETCH BY STATUS
    @Test
    void getDispatchByStatus_ShouldReturn200_WithList() throws Exception {

        when(dispatchService.fetchByStatus(DispatchStatus.ASSIGNED))
                .thenReturn(List.of(responseDTO));

        mockMvc.perform(get("/cargoRoute/dispatches/getDispatchByStatus/ASSIGNED"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].dispatch.status").value("ASSIGNED"));
    }

    // FETCH ALL
    @Test
    void getAllDispatches_ShouldReturn200_WithList() throws Exception {

        when(dispatchService.fetchAll())
                .thenReturn(List.of(responseDTO));

        mockMvc.perform(get("/cargoRoute/dispatches/getAllDispatches"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    // UPDATE
    @Test
    void updateDispatch_ShouldReturn200_WhenUpdated() throws Exception {

        mockMvc.perform(put("/cargoRoute/dispatches/updateDispatch/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dispatchDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message")
                        .value("Dispatch updated successfully."));
    }

    // DELETE
    @Test
    void deleteDispatch_ShouldReturn200_WhenDeleted() throws Exception {

        mockMvc.perform(delete("/cargoRoute/dispatches/deleteDispatch/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message")
                        .value("Dispatch deleted successfully."));
    }
}