package com.gestion.incidencias.controller;

import com.gestion.incidencias.entity.Notificacion;
import com.gestion.incidencias.entity.Usuario;
import com.gestion.incidencias.service.NotificacionService;
import com.gestion.incidencias.util.UsuarioUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/notificaciones")
@SecurityRequirement(name = "X-Email")
@Tag(name = "Notificaciones", description = "Gestión de notificaciones de usuarios")
public class NotificacionController {

    private final NotificacionService notificacionService;
    private final UsuarioUtil usuarioUtil;

    public NotificacionController(NotificacionService notificacionService, UsuarioUtil usuarioUtil) {
        this.notificacionService = notificacionService;
        this.usuarioUtil = usuarioUtil;
    }

    @GetMapping("/no-leidas")
    public ResponseEntity<?> obtenerNoLeidas() {
        try {
            Usuario usuario = usuarioUtil.getUsuarioFromRequest();
            System.out.println("Usuario encontrado: " + usuario.getEmail()); // Log para depurar
            return ResponseEntity.ok(notificacionService.obtenerNoLeidas(usuario));
        } catch (Exception e) {
            e.printStackTrace(); // Esto mostrará el error en IntelliJ
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/contar-no-leidas")
    @Operation(summary = "Contar notificaciones no leídas del usuario actual")
    public long contarNoLeidas() {
        Usuario usuario = usuarioUtil.getUsuarioFromRequest();
        return notificacionService.contarNoLeidas(usuario);
    }

    @PostMapping("/marcar-leidas")
    @Operation(summary = "Marcar todas las notificaciones como leídas")
    public ResponseEntity<?> marcarComoLeidas() {
        Usuario usuario = usuarioUtil.getUsuarioFromRequest();
        notificacionService.marcarComoLeidas(usuario);
        return ResponseEntity.ok().build();
    }
}