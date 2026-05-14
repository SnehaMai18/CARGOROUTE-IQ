package com.example.demo.dto.client;

/**
 * Mirrors ManifestService's ProofOfDeliveryResponseDTO wrapper.
 * The getAllProofOfDeliveries endpoint returns a list of this type.
 */
public class ProofOfDeliveryResponseClientDTO {

    private ProofOfDeliveryClientDTO proofOfDelivery;

    public ProofOfDeliveryResponseClientDTO() {}

    public ProofOfDeliveryClientDTO getProofOfDelivery() { return proofOfDelivery; }
    public void setProofOfDelivery(ProofOfDeliveryClientDTO proofOfDelivery) { this.proofOfDelivery = proofOfDelivery; }
}
