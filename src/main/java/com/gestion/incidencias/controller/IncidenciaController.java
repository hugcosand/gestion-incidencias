package com.gestion.incidencias.controller;

import com.gestion.incidencias.dto.IncidenciaDTO;
import com.gestion.incidencias.entity.Incidencia;
import com.gestion.incidencias.entity.Usuario;
import com.gestion.incidencias.entity.Rol;
import com.gestion.incidencias.service.IncidenciaService;
import com.gestion.incidencias.util.UsuarioUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/incidencias")
@SecurityRequirement(name = "X-Email")
@Tag(name = "Incidencias", description = "CRUD de incidencias")
public class IncidenciaController {

    private final IncidenciaService incidenciaService;
    private final UsuarioUtil usuarioUtil;

    public IncidenciaController(IncidenciaService incidenciaService, UsuarioUtil usuarioUtil) {
        this.incidenciaService = incidenciaService;
        this.usuarioUtil = usuarioUtil;
    }

    @GetMapping
    @Operation(summary = "Listar todas las incidencias", description = "Acceso para ADMIN y PROFESOR")
    public List<Incidencia> listarTodas() {
        return incidenciaService.obtenerTodas();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener incidencia por ID")
    public ResponseEntity<Incidencia> obtenerPorId(@PathVariable Long id) {
        Incidencia incidencia = incidenciaService.obtenerPorId(id);
        if (incidencia == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(incidencia);
    }

    @PostMapping
    @Operation(summary = "Crear nueva incidencia", description = "Solo ADMIN")
    public ResponseEntity<?> crear(@Valid @RequestBody IncidenciaDTO incidenciaDTO) {
        Usuario usuario = usuarioUtil.getUsuarioFromRequest();

        if (usuario.getRol() != Rol.ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Solo ADMIN puede crear incidencias");
        }

        // Convertir DTO a Entidad
        Incidencia incidencia = new Incidencia();
        incidencia.setAlumnoNombre(incidenciaDTO.getAlumnoNombre());
        incidencia.setDescripcion(incidenciaDTO.getDescripcion());
        incidencia.setFechaHoraIncidente(incidenciaDTO.getFechaHoraIncidente());
        incidencia.setTipoIncidencia(incidenciaDTO.getTipoIncidencia());
        incidencia.setEstado(incidenciaDTO.getEstado());
        incidencia.setSolucion(incidenciaDTO.getSolucion());
        incidencia.setSensacion(incidenciaDTO.getSensacion());

        // Asignar profesor desde el header (¡IMPORTANTE!)
        incidencia.setProfesor(usuario);

        Incidencia nueva = incidenciaService.guardar(incidencia);
        return ResponseEntity.status(HttpStatus.CREATED).body(nueva);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar incidencia", description = "Solo ADMIN")
    public ResponseEntity<?> actualizar(@PathVariable Long id, @Valid @RequestBody IncidenciaDTO incidenciaDTO) {
        Usuario usuario = usuarioUtil.getUsuarioFromRequest();

        if (usuario.getRol() != Rol.ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Solo ADMIN puede editar incidencias");
        }

        Incidencia incidenciaExistente = incidenciaService.obtenerPorId(id);
        if (incidenciaExistente == null) {
            return ResponseEntity.notFound().build();
        }

        // Actualizar campos desde DTO
        incidenciaExistente.setAlumnoNombre(incidenciaDTO.getAlumnoNombre());
        incidenciaExistente.setDescripcion(incidenciaDTO.getDescripcion());
        incidenciaExistente.setFechaHoraIncidente(incidenciaDTO.getFechaHoraIncidente());
        incidenciaExistente.setTipoIncidencia(incidenciaDTO.getTipoIncidencia());
        incidenciaExistente.setEstado(incidenciaDTO.getEstado());
        incidenciaExistente.setSolucion(incidenciaDTO.getSolucion());
        incidenciaExistente.setSensacion(incidenciaDTO.getSensacion());

        // No cambiamos el profesor en actualización

        Incidencia actualizada = incidenciaService.guardar(incidenciaExistente);
        return ResponseEntity.ok(actualizada);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar incidencia", description = "Solo ADMIN")
    public ResponseEntity<?> eliminar(@PathVariable Long id) {
        Usuario usuario = usuarioUtil.getUsuarioFromRequest();

        if (usuario.getRol() != Rol.ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Solo ADMIN puede eliminar incidencias");
        }

        if (incidenciaService.obtenerPorId(id) == null) {
            return ResponseEntity.notFound().build();
        }

        incidenciaService.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    // NUEVO: Endpoint para filtrar (Caso de uso 4)
    @GetMapping("/filtrar")
    @Operation(summary = "Filtrar incidencias por alumno, fecha o estado")
    public List<Incidencia> filtrar(
            @RequestParam(required = false) String alumno,
            @RequestParam(required = false) String fecha, // Formato: YYYY-MM-DD
            @RequestParam(required = false) String estado) {

        if (alumno != null && !alumno.isEmpty()) {
            return incidenciaService.obtenerPorAlumno(alumno);
        } else if (fecha != null && !fecha.isEmpty()) {
            return incidenciaService.obtenerPorFecha(java.time.LocalDate.parse(fecha));
        } else if (estado != null && !estado.isEmpty()) {
            return incidenciaService.obtenerPorEstado(com.gestion.incidencias.entity.Estado.valueOf(estado));
        } else {
            return incidenciaService.obtenerTodas();
        }
    }
}