package com.gestion.incidencias.dto;

import lombok.Data;

@Data
public class LoginRequest {
    private String email;
    private String password;
}
