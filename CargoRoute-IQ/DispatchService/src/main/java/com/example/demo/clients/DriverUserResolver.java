package com.example.demo.clients;

import java.util.HashMap;
import java.util.Map;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "driver-user-mapping")
public class DriverUserResolver {

    private Map<Long, Long> mapping = new HashMap<>();

    public Long resolveUserId(Long driverId) {
        return mapping.get(driverId);
    }

    public Map<Long, Long> getMapping() {
        return mapping;
    }

    public void setMapping(Map<Long, Long> mapping) {
        this.mapping = mapping;
    }
}