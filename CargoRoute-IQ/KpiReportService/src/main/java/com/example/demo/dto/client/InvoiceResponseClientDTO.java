package com.example.demo.dto.client;

/**
 * Mirrors BillingService InvoiceRequiredResponseDTO — wraps invoice + shipper.
 * Used when deserializing GET /cargoRoute/invoices/getAll response.
 */
public class InvoiceResponseClientDTO {

    private InvoiceClientDTO invoice;

    public InvoiceResponseClientDTO() {}

    public InvoiceClientDTO getInvoice() { return invoice; }
    public void setInvoice(InvoiceClientDTO invoice) { this.invoice = invoice; }
}
