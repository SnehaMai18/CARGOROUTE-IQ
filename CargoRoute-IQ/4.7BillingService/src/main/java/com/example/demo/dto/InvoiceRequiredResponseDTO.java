package com.example.demo.dto;

public class InvoiceRequiredResponseDTO {

    private InvoiceDTO invoice;
    private ShipperDTO shipper;

    public InvoiceDTO getInvoice() {
        return invoice;
    }

    public void setInvoice(InvoiceDTO invoice) {
        this.invoice = invoice;
    }

    public ShipperDTO getShipper() {
        return shipper;
    }

    public void setShipper(ShipperDTO shipper) {
        this.shipper = shipper;
    }
}