
package com.example.demo.service;
import java.util.List;

import com.example.demo.dto.LoadDTO;
import com.example.demo.dto.RequiredResponseDTO;

public interface LoadService {
    RequiredResponseDTO getLoadById(Long id);   // returns enriched response
    List<RequiredResponseDTO> getAllLoads();
    LoadDTO createLoad(LoadDTO loadDTO);
    LoadDTO updateLoad(Long id, LoadDTO loadDTO);
    void deleteLoad(Long id);
}