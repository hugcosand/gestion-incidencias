package com.gestion.incidencias.controller;

import com.gestion.incidencias.dto.LoginRequest;
import com.gestion.incidencias.dto.LoginResponse;
import com.gestion.incidencias.entity.Usuario;
import com.gestion.incidencias.repository.UsuarioRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class AuthController {

    private final UsuarioRepository usuarioRepository;

    public AuthController(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        // Buscar usuario por email
        Usuario usuario = usuarioRepository.findByEmail(loginRequest.getEmail()).orElse(null);

        if (usuario == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Email no registrado");
        }

        // Comparar contraseñas (sin encriptar aún)
        if (!usuario.getPassword().equals(loginRequest.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Contraseña incorrecta");
        }

        if (!usuario.isActivo()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Usuario desactivado");
        }

        // Crear respuesta sin contraseña
        LoginResponse response = new LoginResponse(
                usuario.getId(),
                usuario.getNombre(),
                usuario.getEmail(),
                usuario.getRol(),
                usuario.isActivo()
        );

        return ResponseEntity.ok(response);
    }
}