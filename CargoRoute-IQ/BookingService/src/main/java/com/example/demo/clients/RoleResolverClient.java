package com.example.demo.clients;

import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
public class RoleResolverClient {

    private final RestTemplate restTemplate;

    public RoleResolverClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public Long getUserByRole(String role) {
        return restTemplate.getForObject(
            "http://IDENTITY-ACCESS-MANAGEMENT/cargoRoute/internal/users/role/" + role + "/primary",
            Long.class
        );
    }
}