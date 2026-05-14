package com.example.demo.ServiceImpl;

import java.util.List;

import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.demo.dto.TariffDTO;
import com.example.demo.entity.Tariff;
import com.example.demo.exception.TariffNotFoundException;
import com.example.demo.repository.TariffRepository;
import com.example.demo.service.TariffService;

@Service
public class TariffSerivceimpl implements TariffService {

    @Autowired
    private TariffRepository repo;

    // ================= DTO → ENTITY =================
    private Tariff dtoToEntity(TariffDTO dto) {
        Tariff entity = new Tariff();
        entity.setTariffID(dto.getTariffID());
        entity.setServiceType(dto.getServiceType());
        entity.setRatePerKg(dto.getRatePerKg());
        entity.setRatePerM3(dto.getRatePerM3());
        entity.setMinCharge(dto.getMinCharge());
        entity.setEffectiveFrom(dto.getEffectiveFrom());
        entity.setEffectiveTo(dto.getEffectiveTo());
        entity.setStatus(dto.getStatus());
        return entity;
    }

    // ================= ENTITY → DTO =================
    private TariffDTO entityToDto(Tariff entity) {
        TariffDTO dto = new TariffDTO();
        dto.setTariffID(entity.getTariffID());
        dto.setServiceType(entity.getServiceType());
        dto.setRatePerKg(entity.getRatePerKg());
        dto.setRatePerM3(entity.getRatePerM3());
        dto.setMinCharge(entity.getMinCharge());
        dto.setEffectiveFrom(entity.getEffectiveFrom());
        dto.setEffectiveTo(entity.getEffectiveTo());
        dto.setStatus(entity.getStatus());
        return dto;
    }

    // ================= CREATE =================
    @Override
    public TariffDTO save(TariffDTO tariffDTO) {
        Tariff saved = repo.save(dtoToEntity(tariffDTO));
        return entityToDto(saved);
    }

    // ================= GET ALL =================
    @Override
    public List<TariffDTO> getAll() {
        List<Tariff> tariffs = repo.findAll();
        if (tariffs.isEmpty()) {
            throw new TariffNotFoundException("No tariffs found");
        }
        return tariffs.stream()
                .map(this::entityToDto)
                .collect(Collectors.toList());
    }

    // ================= GET BY ID =================
    @Override
    public TariffDTO getById(Long id) {
        Tariff tariff = repo.findById(id)
                .orElseThrow(() ->
                        new TariffNotFoundException("Tariff not found with id: " + id)
                );
        return entityToDto(tariff);
    }

    // ================= UPDATE =================
    @Override
    public TariffDTO update(Long id, TariffDTO tariffDTO) {
        Tariff existing = repo.findById(id)
                .orElseThrow(() ->
                        new TariffNotFoundException("Tariff not found with id: " + id)
                );

        existing.setServiceType(tariffDTO.getServiceType());
        existing.setRatePerKg(tariffDTO.getRatePerKg());
        existing.setRatePerM3(tariffDTO.getRatePerM3());
        existing.setMinCharge(tariffDTO.getMinCharge());
        existing.setEffectiveFrom(tariffDTO.getEffectiveFrom());
        existing.setEffectiveTo(tariffDTO.getEffectiveTo());
        existing.setStatus(tariffDTO.getStatus());

        return entityToDto(repo.save(existing));
    }

    // ================= DELETE =================
    @Override
    public void delete(Long id) {
        if (!repo.existsById(id)) {
            throw new TariffNotFoundException("Tariff not found with id: " + id);
        }
        repo.deleteById(id);
    }
}