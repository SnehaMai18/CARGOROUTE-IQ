package com.example.demo.dto.client;

/**
 * Mirrors ExceptionService RequiredResponseDTO wrapper:
 * { exceptiondto: ExceptionRecordDTO, bookingdto: BookingDetailsDTO }
 */
public class ExceptionResponseClientDTO {

    private ExceptionClientDTO exceptiondto;

    public ExceptionResponseClientDTO() {}

    public ExceptionClientDTO getExceptiondto() { return exceptiondto; }
    public void setExceptiondto(ExceptionClientDTO exceptiondto) { this.exceptiondto = exceptiondto; }
}
