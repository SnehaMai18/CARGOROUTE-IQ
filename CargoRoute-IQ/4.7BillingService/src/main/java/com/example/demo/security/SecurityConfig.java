package com.example.demo.security;
 
import org.springframework.context.annotation.Bean;

import org.springframework.context.annotation.Configuration;

import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;

import org.springframework.security.config.annotation.web.builders.HttpSecurity;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.security.web.SecurityFilterChain;

import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import org.springframework.http.HttpMethod;
 
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

            .csrf(csrf -> csrf.disable())

            .authorizeHttpRequests(auth -> auth
 
                // ── Auth & Internal ───────────────────────────────
            		
            		.requestMatchers("/cargoRoute/billing-lines/**").permitAll()
            		.requestMatchers("/cargoRoute/invoices/**").permitAll()
            		.requestMatchers("/cargoRoute/tariffs/**").permitAll()


 
//                // ── BillingLine endpoints ─────────────────────────
//
//                .requestMatchers(HttpMethod.POST,   "/cargoRoute/billing-lines/create").hasAnyRole("BillingClerk","Admin")
//
//                .requestMatchers(HttpMethod.GET,    "/cargoRoute/billing-lines/getBy/*").hasAnyRole("BillingClerk","Admin","Analyst")
//
//                .requestMatchers(HttpMethod.GET,    "/cargoRoute/billing-lines/getAll").hasAnyRole("BillingClerk","Admin","Analyst")
//
//                .requestMatchers(HttpMethod.PUT,    "/cargoRoute/billing-lines/update/*").hasAnyRole("BillingClerk","Admin")
//
//                .requestMatchers(HttpMethod.DELETE, "/cargoRoute/billing-lines/delete/*").hasRole("Admin")
// 
//                // ── Invoice endpoints ─────────────────────────────
//
//                .requestMatchers(HttpMethod.POST,   "/cargoRoute/invoices/create").hasAnyRole("BillingClerk","Admin")
//
//                .requestMatchers(HttpMethod.GET,    "/cargoRoute/invoices/getAll").hasAnyRole("BillingClerk","Admin","Analyst","Shipper")
//
//                .requestMatchers(HttpMethod.GET,    "/cargoRoute/invoices/getBy/*").hasAnyRole("BillingClerk","Admin","Analyst","Shipper")
//
//                .requestMatchers(HttpMethod.PUT,    "/cargoRoute/invoices/update/*").hasAnyRole("BillingClerk","Admin")
//
//                .requestMatchers(HttpMethod.DELETE, "/cargoRoute/invoices/delete/*").hasRole("Admin")
// 
//                // ── Tariff endpoints ──────────────────────────────
//
//                .requestMatchers(HttpMethod.POST,   "/cargoRoute/tariffs/create").hasRole("Admin")
//
//                .requestMatchers(HttpMethod.GET,    "/cargoRoute/tariffs/getAll").hasAnyRole("BillingClerk","Admin","Analyst")
//
//                .requestMatchers(HttpMethod.GET,    "/cargoRoute/tariffs/getBy/*").hasAnyRole("BillingClerk","Admin","Analyst")
//
//                .requestMatchers(HttpMethod.PUT,    "/cargoRoute/tariffs/update/*").hasRole("Admin")
//
//                .requestMatchers(HttpMethod.DELETE, "/cargoRoute/tariffs/delete/*").hasRole("Admin")
// 
                // ── Everything else ───────────────────────────────

                .anyRequest().authenticated()

            )

            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
 
        return http.build();

    }

}

 