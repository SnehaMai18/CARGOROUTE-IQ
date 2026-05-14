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

                .requestMatchers("/cargoRoute/loads/getLoad/**").permitAll()
                .requestMatchers("/cargoRoute/vehicles/getVehicle/**").permitAll()
                .requestMatchers("/cargoRoute/routingRules/getRoutingRule/**").permitAll()

                // ✅ UI / USER APIs (ROLE BASED)
                .requestMatchers("/cargoRoute/routes/**")
                    .hasAnyRole("Admin", "Dispatcher", "FleetManager")
                .requestMatchers("/cargoRoute/routingRules/**")
                    .hasAnyRole("Admin", "Dispatcher", "FleetManager")
                 .requestMatchers("/cargoRoute/loads/**").permitAll()

                // Everything else requires authentication
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}