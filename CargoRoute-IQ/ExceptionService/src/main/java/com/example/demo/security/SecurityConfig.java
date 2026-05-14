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
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth

                // Auth endpoints
                .requestMatchers("/auth/**").permitAll()



                .requestMatchers("/cargoRoute/exception/addException").hasAnyRole("SHIPPER", "DISPATCHER","ADMIN")
                .requestMatchers("/cargoRoute/exception/getExceptions").hasAnyRole("SHIPPER", "DISPATCHER", "ADMIN", "FLEETMANAGER", "WAREHOUSEMANAGER", "BILLINGCLERK", "BILLING_CLERK", "ANALYST")
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/cargoRoute/exception/export").hasAnyRole("SHIPPER", "DISPATCHER", "ADMIN", "FLEETMANAGER", "WAREHOUSEMANAGER", "BILLINGCLERK", "BILLING_CLERK", "ANALYST")
                .requestMatchers("/cargoRoute/claim/addClaim").hasAnyRole("SHIPPER", "ADMIN")
                .requestMatchers("/cargoRoute/claim/getClaims").hasAnyRole("SHIPPER", "DISPATCHER", "ADMIN", "FLEETMANAGER", "WAREHOUSEMANAGER", "BILLINGCLERK", "BILLING_CLERK", "ANALYST")
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/cargoRoute/claim/export").hasAnyRole("SHIPPER", "DISPATCHER", "ADMIN", "FLEETMANAGER", "WAREHOUSEMANAGER", "BILLINGCLERK", "BILLING_CLERK", "ANALYST")
                .requestMatchers("/cargoRoute/claim/updateClaimStatus/**").hasRole("ADMIN")
                .requestMatchers("/cargoRoute/exception/updateExceptionStatus/**").hasAnyRole("DISPATCHER", "DRIVER", "ADMIN")

                // Everything else
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}