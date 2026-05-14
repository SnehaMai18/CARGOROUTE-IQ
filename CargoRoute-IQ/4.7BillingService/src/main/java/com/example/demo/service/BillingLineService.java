package com.example.demo.service;

import java.util.List;

import com.example.demo.dto.BillingLineDTO;
import com.example.demo.dto.BillingLineResponseDTO;

public interface BillingLineService {

    BillingLineResponseDTO create(BillingLineDTO dto);

    BillingLineResponseDTO getById(Long id);

    List<BillingLineResponseDTO> getAll();

    BillingLineResponseDTO update(Long id, BillingLineDTO dto);

    void delete(Long id);
}
