package com.gestion.incidencias.controller;

import com.gestion.incidencias.entity.Solucion;
import com.gestion.incidencias.entity.Usuario;
import com.gestion.incidencias.entity.Rol;
import com.gestion.incidencias.service.SolucionService;
import com.gestion.incidencias.util.UsuarioUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/soluciones")
@SecurityRequirement(name = "X-Email")
@Tag(name = "Soluciones", description = "Gestión de soluciones (solo ADMIN)")
public class SolucionController {

    private final SolucionService solucionService;
    private final UsuarioUtil usuarioUtil;

    public SolucionController(SolucionService solucionService, UsuarioUtil usuarioUtil) {
        this.solucionService = solucionService;
        this.usuarioUtil = usuarioUtil;
    }

    private void checkAdmin() {
        Usuario usuario = usuarioUtil.getUsuarioFromRequest();
        if (usuario.getRol() != Rol.ADMIN) {
            throw new RuntimeException("Acceso denegado: solo administradores");
        }
    }

    @GetMapping
    @Operation(summary = "Listar todas las soluciones")
    public List<Solucion> listarTodas() {
        return solucionService.obtenerTodas();
    }

    @GetMapping("/activas")
    @Operation(summary = "Listar solo soluciones activas (para incidencias)")
    public List<Solucion> listarActivas() {
        return solucionService.obtenerActivas();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener solución por ID")
    public ResponseEntity<Solucion> obtenerPorId(@PathVariable Long id) {
        Solucion solucion = solucionService.obtenerPorId(id);
        if (solucion == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(solucion);
    }

    @PostMapping
    @Operation(summary = "Crear nueva solución")
    public ResponseEntity<?> crear(@RequestBody Solucion solucion) {
        checkAdmin();
        try {
            Solucion nueva = solucionService.guardar(solucion);
            return ResponseEntity.status(HttpStatus.CREATED).body(nueva);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar solución")
    public ResponseEntity<?> actualizar(@PathVariable Long id, @RequestBody Solucion solucion) {
        checkAdmin();
        if (solucionService.obtenerPorId(id) == null) {
            return ResponseEntity.notFound().build();
        }
        solucion.setId(id);
        try {
            Solucion actualizada = solucionService.guardar(solucion);
            return ResponseEntity.ok(actualizada);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar solución (solo si no está en uso)")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        checkAdmin();
        if (solucionService.obtenerPorId(id) == null) {
            return ResponseEntity.notFound().build();
        }
        solucionService.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/desactivar")
    @Operation(summary = "Desactivar solución (mantener en incidencias existentes)")
    public ResponseEntity<Solucion> desactivar(@PathVariable Long id) {
        checkAdmin();
        Solucion desactivada = solucionService.desactivar(id);
        if (desactivada == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(desactivada);
    }
}