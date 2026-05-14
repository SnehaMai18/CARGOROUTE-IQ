package com.example.demo.dto.client;

/**
 * Mirrors BillingService BillingLineResponseDTO — wraps billing + booking + load.
 * GET /cargoRoute/billing-lines/getAll returns List of these.
 */
public class BillingLineResponseClientDTO {

    private BillingLineClientDTO billing;

    public BillingLineResponseClientDTO() {}

    public BillingLineClientDTO getBilling() { return billing; }
    public void setBilling(BillingLineClientDTO billing) { this.billing = billing; }
}
