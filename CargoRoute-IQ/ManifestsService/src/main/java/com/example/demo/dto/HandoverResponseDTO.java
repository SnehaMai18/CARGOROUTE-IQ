package com.example.demo.dto;


public class HandoverResponseDTO {
    private HandoverDTO handover;
    private ManifestRequiredResponseDTO manifestDetails;

    public HandoverDTO getHandover() {
        return handover;
    }

    public void setHandover(HandoverDTO handover) {
        this.handover = handover;
    }

    public ManifestRequiredResponseDTO getManifestDetails() {
        return manifestDetails;
    }

    public void setManifestDetails(ManifestRequiredResponseDTO manifestDetails) {
        this.manifestDetails = manifestDetails;
    }
}