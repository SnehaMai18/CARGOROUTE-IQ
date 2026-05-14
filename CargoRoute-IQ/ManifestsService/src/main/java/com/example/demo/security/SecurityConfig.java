package com.example.demo.security;
 
import org.springframework.context.annotation.Bean;

import org.springframework.context.annotation.Configuration;

import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;

import org.springframework.security.config.annotation.web.builders.HttpSecurity;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.security.web.SecurityFilterChain;

import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
 
@Configuration

@EnableMethodSecurity(prePostEnabled = true)

public class SecurityConfig {
 
    private final JwtFilter jwtFilter;
 
    public SecurityConfig(JwtFilter jwtFilter) {

        this.jwtFilter = jwtFilter;

    }
 
    @Bean

    public PasswordEncoder passwordEncoder() {

        return new BCryptPasswordEncoder();

    }
 
    @Bean

    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
 
        http

            .cors(org.springframework.security.config.Customizer.withDefaults())

            .csrf(csrf -> csrf.disable())

            .authorizeHttpRequests(auth -> auth
            		
            		.requestMatchers("/manifests/**").permitAll()
                    .requestMatchers("/pods/**").permitAll()
 
                // Manifest endpoints - require authentication
            		
                .requestMatchers("/cargoRoute/manifests/**").permitAll()

//                .requestMatchers("/cargoRoute/proof-of-delivery/**").hasAnyRole("Admin","Driver","Dispatcher","FleetManager","BillingClerk","WareHouseManager","Analyst","Shipper")    

                .requestMatchers("/cargoRoute/proof-of-delivery/**").permitAll()
//                .requestMatchers("/cargoRoute/handovers/**").hasAnyRole("Admin","Driver","Dispatcher","FleetManager","BillingClerk","WareHouseManager","Analyst")    
                .requestMatchers("/cargoRoute/handovers/**").permitAll()
                // Everything else requires authentication

                .anyRequest().authenticated()

            )

            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
 
        return http.build();

    }

}

 