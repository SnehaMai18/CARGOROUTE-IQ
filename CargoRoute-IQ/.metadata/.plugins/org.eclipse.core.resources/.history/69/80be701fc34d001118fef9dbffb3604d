package com.example.demo.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import org.springframework.security.access.prepost.PreAuthorize;

import com.example.demo.dto.BillingLineDTO;

import com.example.demo.dto.BillingLineResponseDTO;

import com.example.demo.service.BillingLineService;

@RestController

@RequestMapping("cargoRoute/billing-lines")

public class BillingLineController {

   private final BillingLineService service;

   public BillingLineController(BillingLineService service) {

       this.service = service;

   }

   // CREATE — BillingClerk or Admin

   @PreAuthorize("hasAnyRole('BillingClerk','Admin')")

   @PostMapping("/create")

   public BillingLineResponseDTO create(@RequestBody BillingLineDTO dto) {

       return service.create(dto);

   }

   // GET BY ID — BillingClerk, Admin, Analyst

//   @PreAuthorize("hasAnyRole('BillingClerk','Admin','Shipper','Analyst')")

   @GetMapping("/getBy/{id}")

   public BillingLineResponseDTO get(@PathVariable Long id) {

       return service.getById(id);

   }

   // GET ALL — BillingClerk, Admin, Analyst

//   @PreAuthorize("hasAnyRole('BillingClerk','Admin','Shipper','Analyst')")

   @GetMapping("/getAll")

   public List<BillingLineResponseDTO> getAll() {

       return service.getAll();

   }

   // UPDATE — BillingClerk or Admin

   @PreAuthorize("hasAnyRole('BillingClerk','Admin')")

   @PutMapping("/update/{id}")

   public BillingLineResponseDTO update(@PathVariable Long id,

                                        @RequestBody BillingLineDTO dto) {

       return service.update(id, dto);

   }

   // DELETE — Admin only
   @PreAuthorize("hasRole('Admin')")

   @DeleteMapping("/delete/{id}")

   public void delete(@PathVariable Long id) {

       service.delete(id);

   }

}

