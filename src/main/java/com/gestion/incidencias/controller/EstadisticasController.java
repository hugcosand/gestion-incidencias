package com.gestion.incidencias.controller;

import com.gestion.incidencias.dto.EstadisticasDTO;
import com.gestion.incidencias.entity.Rol;
import com.gestion.incidencias.entity.Usuario;
import com.gestion.incidencias.service.EstadisticasService;
import com.gestion.incidencias.service.UsuarioService;
import com.gestion.incidencias.util.UsuarioUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/estadisticas")
@SecurityRequirement(name = "X-Email")
@Tag(name = "Estadísticas", description = "Resumen estadístico de incidencias")
public class EstadisticasController {

    private final EstadisticasService estadisticasService;
    private final UsuarioService usuarioService;
    private final UsuarioUtil usuarioUtil;

    public EstadisticasController(EstadisticasService estadisticasService,
                                  UsuarioService usuarioService,
                                  UsuarioUtil usuarioUtil) {
        this.estadisticasService = estadisticasService;
        this.usuarioService = usuarioService;
        this.usuarioUtil = usuarioUtil;
    }

    @GetMapping
    @Operation(
            summary = "Estadísticas generales",
            description = "Total de incidencias, desglose por estado y tipo, " +
                    "profesor más activo y alumnos con más incidencias. Solo ADMIN."
    )
    public ResponseEntity<?> obtenerEstadisticas() {
        Usuario usuario = usuarioUtil.getUsuarioFromRequest();

        if (usuario.getRol() != Rol.ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Acceso denegado: solo administradores pueden ver las estadísticas globales");
        }

        return ResponseEntity.ok(estadisticasService.obtenerEstadisticas());
    }

    @GetMapping("/profesor/{id}")
    @Operation(
            summary = "Estadísticas de un profesor concreto",
            description = "Devuelve las estadísticas filtradas por el profesor indicado. " +
                    "El ADMIN puede consultar cualquier profesor; " +
                    "un PROFESOR solo puede consultar las suyas."
    )
    public ResponseEntity<?> obtenerEstadisticasPorProfesor(@PathVariable Long id) {
        Usuario usuarioActual = usuarioUtil.getUsuarioFromRequest();

        // Un PROFESOR solo puede ver sus propias estadísticas
        if (usuarioActual.getRol() == Rol.PROFESOR &&
                !usuarioActual.getId().equals(id)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Solo puedes consultar tus propias estadísticas");
        }

        Usuario profesor = usuarioService.obtenerPorId(id);
        if (profesor == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Profesor no encontrado");
        }

        return ResponseEntity.ok(estadisticasService.obtenerEstadisticasPorProfesor(profesor));
    }
}