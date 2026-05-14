package com.example.demo.service;

import java.util.List;

import com.example.demo.dto.TariffDTO;

public interface TariffService {

    // CREATE
    TariffDTO save(TariffDTO tariffDTO);

    // READ
    List<TariffDTO> getAll();

    TariffDTO getById(Long id);

    // ✅ UPDATE
    TariffDTO update(Long id, TariffDTO tariffDTO);

    // ✅ DELETE
    void delete(Long id);
}