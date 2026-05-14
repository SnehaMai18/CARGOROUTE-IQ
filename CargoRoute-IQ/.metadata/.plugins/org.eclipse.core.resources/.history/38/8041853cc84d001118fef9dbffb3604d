package com.example.demo.controller;
 
import java.util.List;
 
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import com.example.demo.dto.TariffDTO;
import com.example.demo.service.TariffService;
 
@RestController
@RequestMapping("cargoRoute/tariffs")
public class TariffController {
    @Autowired
    private TariffService service;
    // ================= CREATE =================
    // Admin only
    @PreAuthorize("hasRole('Admin')")
    @PostMapping("/create")
    public ResponseEntity<TariffDTO> createTariff(
            @Valid @RequestBody TariffDTO tariffDTO) {
        return ResponseEntity.ok(service.save(tariffDTO));
    }
 
    // ================= GET ALL =================
    // Admin, BillingClerk, Analyst
//    @PreAuthorize("hasAnyRole('BillingClerk','Admin','Shipper','Analyst')")
    @GetMapping("/getAll")
    public ResponseEntity<List<TariffDTO>> getAllTariffs() {
        return ResponseEntity.ok(service.getAll());
    }
 
    // ================= GET BY ID =================
    // Admin, BillingClerk, Analyst
//    @PreAuthorize("hasAnyRole('BillingClerk','Admin','Analyst')")
    @GetMapping("/getBy/{id}")
    public ResponseEntity<TariffDTO> getTariffById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }
 
    // ================= UPDATE =================
    // Admin only
    @PreAuthorize("hasRole('Admin')")
    @PutMapping("/update/{id}")
    public ResponseEntity<TariffDTO> updateTariff(
            @PathVariable Long id,
            @Valid @RequestBody TariffDTO tariffDTO) {
        return ResponseEntity.ok(service.update(id, tariffDTO));
    }
 
    // ================= DELETE =================

    // Admin only
    @PreAuthorize("hasRole('Admin')")
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deleteTariff(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.ok("Tariff deleted successfully");
    }
}

 