package com.gestion.incidencias.util;

import com.gestion.incidencias.entity.Usuario;
import com.gestion.incidencias.repository.UsuarioRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Component;

@Component
public class UsuarioUtil {

    private final UsuarioRepository usuarioRepository;
    private final HttpServletRequest request;

    public UsuarioUtil(UsuarioRepository usuarioRepository, HttpServletRequest request) {
        this.usuarioRepository = usuarioRepository;
        this.request = request;
    }

    public Usuario getUsuarioFromHeader() {
        String email = request.getHeader("X-User-Email");
        if (email == null) {
            throw new RuntimeException("Email de usuario no proporcionado en el header");
        }
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }
}