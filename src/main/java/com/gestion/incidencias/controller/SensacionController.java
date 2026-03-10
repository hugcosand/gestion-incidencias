package com.gestion.incidencias.controller;

import com.gestion.incidencias.entity.Sensacion;
import com.gestion.incidencias.entity.Usuario;
import com.gestion.incidencias.entity.Rol;
import com.gestion.incidencias.service.SensacionService;
import com.gestion.incidencias.util.UsuarioUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sensaciones")
@SecurityRequirement(name = "X-Email")
@Tag(name = "Sensaciones", description = "Gestión de sensaciones (solo ADMIN)")
public class SensacionController {

    private final SensacionService sensacionService;
    private final UsuarioUtil usuarioUtil;

    public SensacionController(SensacionService sensacionService, UsuarioUtil usuarioUtil) {
        this.sensacionService = sensacionService;
        this.usuarioUtil = usuarioUtil;
    }

    private void checkAdmin() {
        Usuario usuario = usuarioUtil.getUsuarioFromRequest();
        if (usuario.getRol() != Rol.ADMIN) {
            throw new RuntimeException("Acceso denegado: solo administradores");
        }
    }

    @GetMapping
    @Operation(summary = "Listar todas las sensaciones")
    public List<Sensacion> listarTodas() {
        return sensacionService.obtenerTodas();
    }

    @GetMapping("/activas")
    @Operation(summary = "Listar solo sensaciones activas (para incidencias)")
    public List<Sensacion> listarActivas() {
        return sensacionService.obtenerActivas();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener sensación por ID")
    public ResponseEntity<Sensacion> obtenerPorId(@PathVariable Long id) {
        Sensacion sensacion = sensacionService.obtenerPorId(id);
        if (sensacion == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(sensacion);
    }

    @PostMapping
    @Operation(summary = "Crear nueva sensación")
    public ResponseEntity<?> crear(@RequestBody Sensacion sensacion) {
        checkAdmin();
        try {
            Sensacion nueva = sensacionService.guardar(sensacion);
            return ResponseEntity.status(HttpStatus.CREATED).body(nueva);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar sensación")
    public ResponseEntity<?> actualizar(@PathVariable Long id, @RequestBody Sensacion sensacion) {
        checkAdmin();
        if (sensacionService.obtenerPorId(id) == null) {
            return ResponseEntity.notFound().build();
        }
        sensacion.setId(id);
        try {
            Sensacion actualizada = sensacionService.guardar(sensacion);
            return ResponseEntity.ok(actualizada);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar sensación (solo si no está en uso)")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        checkAdmin();
        if (sensacionService.obtenerPorId(id) == null) {
            return ResponseEntity.notFound().build();
        }
        sensacionService.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/desactivar")
    @Operation(summary = "Desactivar sensación (mantener en incidencias existentes)")
    public ResponseEntity<Sensacion> desactivar(@PathVariable Long id) {
        checkAdmin();
        Sensacion desactivada = sensacionService.desactivar(id);
        if (desactivada == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(desactivada);
    }
}