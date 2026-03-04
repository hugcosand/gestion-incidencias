package com.gestion.incidencias.dto;

import com.gestion.incidencias.entity.Rol;
import lombok.Data;

@Data
public class LoginResponse {
    private Long id;
    private String nombre;
    private String email;
    private Rol rol;
    private boolean activo;

    // Constructor que recibe un Usuario
    public LoginResponse(Long id, String nombre, String email, Rol rol, boolean activo) {
        this.id = id;
        this.nombre = nombre;
        this.email = email;
        this.rol = rol;
        this.activo = activo;
    }
}