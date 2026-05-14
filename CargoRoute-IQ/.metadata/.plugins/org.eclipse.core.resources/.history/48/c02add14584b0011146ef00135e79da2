package com.example.demo.controller;
import com.example.demo.dto.DriverDTO;
import com.example.demo.entities.enums.DriverStatus;
import com.example.demo.exception.GlobalExceptionHandler;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.service.DriverService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class DriverControllerTest {

    private MockMvc mockMvc;

    @Mock
    private DriverService driverService;

    @InjectMocks
    private DriverController driverController;

    private ObjectMapper objectMapper;
    private DriverDTO driverDTO;

    @BeforeEach
    void setUp() {

        mockMvc = MockMvcBuilders.standaloneSetup(driverController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();

        objectMapper = new ObjectMapper();

        driverDTO = new DriverDTO();
        driverDTO.setDriverID(1L);
        driverDTO.setName("Sai");
        driverDTO.setStatus(DriverStatus.AVAILABLE);
        driverDTO.setLicenseNo("LIC123");
        driverDTO.setMobileNumber("9999999999");
    }

    //POST /cargoRoute/drivers/createDriver

    @Test
    void createDriver_ShouldReturn201_WhenCreated() throws Exception {

        mockMvc.perform(post("/cargoRoute/drivers/createDriver")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(driverDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.message").value("Driver created successfully."));
    }

    //GET /cargoRoute/drivers/getDriverByDriverId/{id}

    @Test
    void getDriverById_ShouldReturn200_WhenFound() throws Exception {

        when(driverService.fetchByID(1L))
                .thenReturn(driverDTO);

        mockMvc.perform(get("/cargoRoute/drivers/getDriverByDriverId/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.driverID").value(1))
                .andExpect(jsonPath("$.name").value("Sai"));
    }

    @Test
    void getDriverById_ShouldReturn404_WhenNotFound() throws Exception {

        when(driverService.fetchByID(99L))
                .thenThrow(new ResourceNotFoundException("Driver not found"));

        mockMvc.perform(get("/cargoRoute/drivers/getDriverByDriverId/99"))
                .andExpect(status().isNotFound());
    }

    //GET /cargoRoute/drivers/getDriverByStatus/{status} 

    @Test
    void getDriverByStatus_ShouldReturn200_WithList() throws Exception {

        when(driverService.fetchByStatus(DriverStatus.AVAILABLE))
                .thenReturn(List.of(driverDTO));

        mockMvc.perform(get("/cargoRoute/drivers/getDriverByStatus/AVAILABLE"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].status").value("AVAILABLE"));
    }

    //GET ALL 
    @Test
    void getAllDrivers_ShouldReturn200_WithList() throws Exception {

        when(driverService.fetchAll())
                .thenReturn(List.of(driverDTO));

        mockMvc.perform(get("/cargoRoute/drivers/getAllDrivers"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    //PUT /cargoRoute/drivers/updateDriver/{id} 
    @Test
    void updateDriver_ShouldReturn200_WhenUpdated() throws Exception {

        mockMvc.perform(put("/cargoRoute/drivers/updateDriver/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(driverDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message")
                        .value("Driver updated successfully."));
    }
    
    //DELETE /cargoRoute/drivers/deleteById/{id}
    @Test
    void deleteDriver_ShouldReturn200_WhenDeleted() throws Exception {

        mockMvc.perform(delete("/cargoRoute/drivers/deleteById/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message")
                        .value("Driver deleted successfully."));
    }
}