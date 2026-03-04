package com.gestion.incidencias.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(authz -> authz
                        .anyRequest().permitAll() // Permite todo sin autenticación
                )
                .formLogin(form -> form.disable()) // Desactiva el formulario de login por defecto
                .httpBasic(basic -> basic.disable()); // Desactiva autenticación básica

        return http.build();
    }
}