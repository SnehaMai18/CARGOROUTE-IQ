package com.example.demo.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpServletResponseWrapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOriginPatterns(List.of("http://localhost:3000", "http://127.0.0.1:*"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }

    @Bean
    public FilterRegistrationBean<OncePerRequestFilter> corsHeaderSanitizerFilter() {
        FilterRegistrationBean<OncePerRequestFilter> registration = new FilterRegistrationBean<>();

        registration.setFilter(new OncePerRequestFilter() {
            @Override
            protected void doFilterInternal(HttpServletRequest request,
                                            HttpServletResponse response,
                                            FilterChain filterChain) throws ServletException, IOException {
                HttpServletResponseWrapper responseWrapper = new HttpServletResponseWrapper(response) {
                    @Override
                    public void addHeader(String name, String value) {
                        if (isCorsHeader(name)) {
                            super.setHeader(name, value);
                            return;
                        }
                        super.addHeader(name, value);
                    }

                    @Override
                    public void setHeader(String name, String value) {
                        if (isCorsHeader(name)) {
                            super.setHeader(name, value);
                            return;
                        }
                        super.setHeader(name, value);
                    }

                    private boolean isCorsHeader(String name) {
                        return "Access-Control-Allow-Origin".equalsIgnoreCase(name)
                                || "Access-Control-Allow-Credentials".equalsIgnoreCase(name)
                                || "Vary".equalsIgnoreCase(name);
                    }
                };

                filterChain.doFilter(request, responseWrapper);

                String origin = request.getHeader("Origin");
                if (origin == null) {
                    return;
                }

                boolean allowed = origin.startsWith("http://localhost:")
                        || origin.startsWith("http://127.0.0.1:");

                if (allowed) {
                    response.setHeader("Access-Control-Allow-Origin", origin);
                    response.setHeader("Access-Control-Allow-Credentials", "true");
                    response.setHeader("Vary", "Origin,Access-Control-Request-Method,Access-Control-Request-Headers");
                }
            }
        });

        registration.setOrder(Ordered.LOWEST_PRECEDENCE);
        return registration;
    }
}
