package com.example.demo;

import org.springframework.boot.SpringApplication;

import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.client.loadbalancer.LoadBalanced;
import org.springframework.context.annotation.Bean;
import org.springframework.web.client.RestTemplate;

@SpringBootApplication

@EnableDiscoveryClient

public class FleetServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(FleetServiceApplication.class, args);
	}
	@Bean
    @LoadBalanced   // important: lets RestTemplate resolve service names via Eureka
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }

}
