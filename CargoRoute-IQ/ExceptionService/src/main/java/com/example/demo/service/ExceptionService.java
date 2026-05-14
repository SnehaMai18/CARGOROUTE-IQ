package com.example.demo.service;

import java.util.List;

import com.example.demo.dto.ExceptionRecordDTO;
import com.example.demo.dto.RequiredResponseDTO;
import com.example.demo.entity.enums.ExceptionStatus;

public interface ExceptionService {
  
    public ExceptionRecordDTO createException(ExceptionRecordDTO dto);
    public List<RequiredResponseDTO> getAllExceptions();
    public RequiredResponseDTO getExceptionById(Long id);
    public ExceptionRecordDTO updateExceptionStatus(Long id, ExceptionStatus status);
    public List<RequiredResponseDTO> getExceptionByBookingId(Long bookingId);
    public List<RequiredResponseDTO> getExceptionByStatus(ExceptionStatus status);
}
