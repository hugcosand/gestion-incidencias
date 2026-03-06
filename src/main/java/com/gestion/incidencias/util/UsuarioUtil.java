package com.gestion.incidencias.util;

import com.gestion.incidencias.entity.Usuario;
import com.gestion.incidencias.repository.UsuarioRepository;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import jakarta.servlet.http.HttpServletRequest;

@Component
public class UsuarioUtil {

    private final UsuarioRepository usuarioRepository;

    public UsuarioUtil(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    public Usuario getUsuarioFromRequest() {
        HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.currentRequestAttributes()).getRequest();
        String email = request.getHeader("X-Email");

        if (email == null || email.isEmpty()) {
            throw new RuntimeException("Email de usuario no proporcionado en el header X-Email");
        }

        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con email: " + email));
    }
}