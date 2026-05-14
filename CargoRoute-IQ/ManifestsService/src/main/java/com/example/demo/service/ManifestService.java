package com.example.demo.service;
import java.util.List;
import org.springframework.web.multipart.MultipartFile;

import com.example.demo.dto.ManifestDTO;
import com.example.demo.dto.ManifestRequiredResponseDTO;

public interface ManifestService {
	
	public ManifestDTO create(ManifestDTO manifestDTO, MultipartFile file);
	public String saveFile(MultipartFile file);
    public ManifestRequiredResponseDTO getById(Long manifestID);
    public List<ManifestRequiredResponseDTO> getAll();
    public ManifestRequiredResponseDTO getByLoadID(Long loadID);
    public List<ManifestRequiredResponseDTO> getByWarehouseID(Long warehouseID);
    public ManifestDTO update(Long manifestID, ManifestDTO manifestDTO);
    public void delete(Long manifestID);
}
