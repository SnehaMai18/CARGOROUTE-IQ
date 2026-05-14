package com.example.demo.security;

import org.springframework.context.annotation.*;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
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
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http
            // JWT based → stateless
            .csrf(csrf -> csrf.disable())

            // Only protect this microservice's endpoints
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/cargoRoute/internal/**").permitAll()
                .requestMatchers("/cargoRoute/notifications/**").permitAll()
                .requestMatchers("/cargoRoute/tasks/**").permitAll()
                .anyRequest().authenticated()
            )

            // Validate JWT before authorization
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}