package com.example.demo;

import org.springframework.boot.SpringApplication;

import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.loadbalancer.LoadBalanced;
import org.springframework.context.annotation.Bean;
import org.springframework.web.client.RestTemplate;

@SpringBootApplication
//@EnableEurekaClient
public class RoutingServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(RoutingServiceApplication.class, args);
	}
	@Bean
    @LoadBalanced  // This makes RestTemplate resolve service names via Eureka
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }

}
