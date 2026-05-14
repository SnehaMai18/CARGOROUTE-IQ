package com.example.demo.service;

import java.util.List;

import com.example.demo.dto.InvoiceDTO;
import com.example.demo.dto.InvoiceRequiredResponseDTO;

public interface InvoiceService {

    // ✅ CREATE
    InvoiceDTO save(InvoiceDTO invoice);

    // ✅ GET ALL WITH SHIPPER
    List<InvoiceRequiredResponseDTO> getAll();

    // ✅ GET BY ID WITH SHIPPER
    InvoiceRequiredResponseDTO getById(Long id);

    // ✅ UPDATE
    InvoiceDTO update(Long id, InvoiceDTO invoice);

    // ✅ DELETE
    void delete(Long id);
}