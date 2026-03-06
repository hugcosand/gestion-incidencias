package com.gestion.incidencias.controller;

import com.gestion.incidencias.dto.LoginRequest;
import com.gestion.incidencias.dto.LoginResponse;
import com.gestion.incidencias.entity.Usuario;
import com.gestion.incidencias.service.UsuarioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@Tag(name = "Autenticación", description = "Endpoints para login de usuarios")
public class AuthController {

    private final UsuarioService usuarioService;
    private final PasswordEncoder passwordEncoder;

    public AuthController(UsuarioService usuarioService, PasswordEncoder passwordEncoder) {
        this.usuarioService = usuarioService;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/login")
    @Operation(summary = "Iniciar sesión", description = "Devuelve los datos del usuario sin contraseña", security = {})
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {

        Usuario usuario = usuarioService.obtenerPorEmail(loginRequest.getEmail());

        if (usuario == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Email no registrado");
        }

        // Verificar contraseña con BCrypt
        if (!passwordEncoder.matches(loginRequest.getPassword(), usuario.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Contraseña incorrecta");
        }

        if (!usuario.isActivo()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Usuario desactivado");
        }

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