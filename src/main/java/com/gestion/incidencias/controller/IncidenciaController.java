package com.gestion.incidencias.controller;

import com.gestion.incidencias.dto.IncidenciaDTO;
import com.gestion.incidencias.entity.Incidencia;
import com.gestion.incidencias.entity.Usuario;
import com.gestion.incidencias.entity.Rol;
import com.gestion.incidencias.entity.Solucion;
import com.gestion.incidencias.entity.Sensacion;
import com.gestion.incidencias.service.IncidenciaService;
import com.gestion.incidencias.service.NotificacionService;
import com.gestion.incidencias.service.SolucionService;
import com.gestion.incidencias.service.SensacionService;
import com.gestion.incidencias.util.UsuarioUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/incidencias")
@SecurityRequirement(name = "X-Email")
@Tag(name = "Incidencias", description = "CRUD de incidencias")
public class IncidenciaController {

    private final IncidenciaService incidenciaService;
    private final UsuarioUtil usuarioUtil;
    private final SolucionService solucionService;
    private final SensacionService sensacionService;
    private final NotificacionService notificacionService;

    public IncidenciaController(IncidenciaService incidenciaService,
                                UsuarioUtil usuarioUtil,
                                SolucionService solucionService,
                                SensacionService sensacionService,
                                NotificacionService notificacionService) {
        this.incidenciaService = incidenciaService;
        this.usuarioUtil = usuarioUtil;
        this.solucionService = solucionService;
        this.sensacionService = sensacionService;
        this.notificacionService = notificacionService;
    }

    @GetMapping
    @Operation(summary = "Listar todas las incidencias", description = "Acceso para ADMIN y PROFESOR")
    public List<Incidencia> listarTodas() {
        return incidenciaService.obtenerTodas();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener incidencia por ID", description = "Acceso para ADMIN y PROFESOR")
    public ResponseEntity<Incidencia> obtenerPorId(@PathVariable Long id) {
        Incidencia incidencia = incidenciaService.obtenerPorId(id);
        if (incidencia == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(incidencia);
    }

    @PostMapping
    @Operation(summary = "Crear nueva incidencia", description = "Acceso para ADMIN y PROFESOR")
    public ResponseEntity<?> crear(@Valid @RequestBody IncidenciaDTO incidenciaDTO) {
        Usuario usuario = usuarioUtil.getUsuarioFromRequest();

        // Permitir ADMIN y PROFESOR
        if (usuario.getRol() != Rol.ADMIN && usuario.getRol() != Rol.PROFESOR) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("No tienes permisos para crear incidencias");
        }

        try {
            // Convertir DTO a Entidad
            Incidencia incidencia = new Incidencia();
            incidencia.setAlumnoNombre(incidenciaDTO.getAlumnoNombre());
            incidencia.setDescripcion(incidenciaDTO.getDescripcion());
            incidencia.setFechaHoraIncidente(incidenciaDTO.getFechaHoraIncidente());
            incidencia.setTipoIncidencia(incidenciaDTO.getTipoIncidencia());
            incidencia.setEstado(incidenciaDTO.getEstado());

            // Buscar solucion por ID si viene
            if (incidenciaDTO.getSolucionId() != null) {
                Solucion solucion = solucionService.obtenerPorId(incidenciaDTO.getSolucionId());
                incidencia.setSolucion(solucion);
            }

            // Buscar sensacion por ID si viene
            if (incidenciaDTO.getSensacionId() != null) {
                Sensacion sensacion = sensacionService.obtenerPorId(incidenciaDTO.getSensacionId());
                incidencia.setSensacion(sensacion);
            }

            // Asignar profesor desde el header (quien crea la incidencia)
            incidencia.setProfesor(usuario);

            Incidencia nueva = incidenciaService.guardar(incidencia);
            return ResponseEntity.status(HttpStatus.CREATED).body(nueva);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al crear la incidencia: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar incidencia", description = "Acceso para ADMIN y PROFESOR (profesores solo pueden editar las suyas)")
    public ResponseEntity<?> actualizar(@PathVariable Long id, @Valid @RequestBody IncidenciaDTO incidenciaDTO) {
        Usuario usuario = usuarioUtil.getUsuarioFromRequest();

        // Verificar permisos básicos
        if (usuario.getRol() != Rol.ADMIN && usuario.getRol() != Rol.PROFESOR) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("No tienes permisos para editar incidencias");
        }

        Incidencia incidenciaExistente = incidenciaService.obtenerPorId(id);
        if (incidenciaExistente == null) {
            return ResponseEntity.notFound().build();
        }

        // Si es PROFESOR, verificar que sea el creador de la incidencia
        if (usuario.getRol() == Rol.PROFESOR &&
                !incidenciaExistente.getProfesor().getId().equals(usuario.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Solo puedes editar tus propias incidencias");
        }

        try {
            // 🔴 GUARDAR COPIA DE LA INCIDENCIA ANTIGUA ANTES DE MODIFICARLA
            Incidencia incidenciaAntigua = copiarIncidencia(incidenciaExistente);

            // Actualizar campos desde DTO
            incidenciaExistente.setAlumnoNombre(incidenciaDTO.getAlumnoNombre());
            incidenciaExistente.setDescripcion(incidenciaDTO.getDescripcion());
            incidenciaExistente.setFechaHoraIncidente(incidenciaDTO.getFechaHoraIncidente());
            incidenciaExistente.setTipoIncidencia(incidenciaDTO.getTipoIncidencia());
            incidenciaExistente.setEstado(incidenciaDTO.getEstado());

            // Actualizar solucion si viene
            if (incidenciaDTO.getSolucionId() != null) {
                Solucion solucion = solucionService.obtenerPorId(incidenciaDTO.getSolucionId());
                incidenciaExistente.setSolucion(solucion);
            } else {
                incidenciaExistente.setSolucion(null);
            }

            // Actualizar sensacion si viene
            if (incidenciaDTO.getSensacionId() != null) {
                Sensacion sensacion = sensacionService.obtenerPorId(incidenciaDTO.getSensacionId());
                incidenciaExistente.setSensacion(sensacion);
            } else {
                incidenciaExistente.setSensacion(null);
            }

            // Guardar la incidencia actualizada
            Incidencia actualizada = incidenciaService.guardar(incidenciaExistente);

            // 🔴 USAR EL NUEVO MÉTODO DE NOTIFICACIÓN CON DETALLE DE CAMBIOS
            // Solo crear notificación si quien actualiza NO es el dueño
            if (!actualizada.getProfesor().getId().equals(usuario.getId())) {
                notificacionService.crearNotificacionIncidenciaActualizada(
                        incidenciaAntigua,    // Estado antes de los cambios
                        actualizada,          // Estado después de los cambios
                        usuario               // Quién hizo los cambios
                );
            }

            return ResponseEntity.ok(actualizada);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al actualizar la incidencia: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar incidencia", description = "Solo ADMIN (o profesor de la incidencia si se permite)")
    public ResponseEntity<?> eliminar(@PathVariable Long id) {
        Usuario usuario = usuarioUtil.getUsuarioFromRequest();

        Incidencia incidencia = incidenciaService.obtenerPorId(id);
        if (incidencia == null) {
            return ResponseEntity.notFound().build();
        }

        // ADMIN puede eliminar cualquier incidencia
        if (usuario.getRol() == Rol.ADMIN) {
            incidenciaService.eliminar(id);
            return ResponseEntity.noContent().build();
        }

        // PROFESOR solo puede eliminar sus propias incidencias
        if (usuario.getRol() == Rol.PROFESOR &&
                incidencia.getProfesor().getId().equals(usuario.getId())) {
            incidenciaService.eliminar(id);
            return ResponseEntity.noContent().build();
        }

        // Si no cumple ninguna condición, denegar
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body("No tienes permisos para eliminar esta incidencia");
    }

    @GetMapping("/filtrar")
    @Operation(summary = "Filtrar incidencias por múltiples criterios")
    public List<Incidencia> filtrar(
            @RequestParam(required = false) String alumno,
            @RequestParam(required = false) String fecha,
            @RequestParam(required = false) String hora,
            @RequestParam(required = false) String tipo,
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) String sensacion,
            @RequestParam(required = false) String solucion,
            @RequestParam(required = false) String profesor) {

        return incidenciaService.filtrar(alumno, fecha, hora, tipo, estado, sensacion, solucion, profesor);
    }

    /**
     * Metodo auxiliar para crear una copia de una incidencia
     */
    private Incidencia copiarIncidencia(Incidencia original) {
        Incidencia copia = new Incidencia();
        copia.setAlumnoNombre(original.getAlumnoNombre());
        copia.setDescripcion(original.getDescripcion());
        copia.setFechaHoraIncidente(original.getFechaHoraIncidente());
        copia.setTipoIncidencia(original.getTipoIncidencia());
        copia.setEstado(original.getEstado());
        copia.setSolucion(original.getSolucion());
        copia.setSensacion(original.getSensacion());
        copia.setProfesor(original.getProfesor());
        return copia;
    }

    @GetMapping("/mis-incidencias")
    @Operation(summary = "Listar incidencias del profesor autenticado",
            description = "Devuelve solo las incidencias creadas por el profesor que hace la petición")
    public ResponseEntity<?> misIncidencias() {
        Usuario usuario = usuarioUtil.getUsuarioFromRequest();

        if (usuario.getRol() != Rol.PROFESOR && usuario.getRol() != Rol.ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Acceso denegado");
        }

        List<Incidencia> resultado = incidenciaService.obtenerPorProfesor(usuario);
        return ResponseEntity.ok(resultado);
    }

    @PatchMapping("/{id}/cerrar")
    @Operation(summary = "Cerrar una incidencia",
            description = "Cambia el estado de la incidencia a RESUELTA. " +
                    "El profesor solo puede cerrar las suyas; el ADMIN puede cerrar cualquiera.")
    public ResponseEntity<?> cerrar(@PathVariable Long id) {
        Usuario usuario = usuarioUtil.getUsuarioFromRequest();

        Incidencia incidencia = incidenciaService.obtenerPorId(id);
        if (incidencia == null) {
            return ResponseEntity.notFound().build();
        }

        // PROFESOR solo puede cerrar las suyas
        if (usuario.getRol() == Rol.PROFESOR &&
                !incidencia.getProfesor().getId().equals(usuario.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Solo puedes cerrar tus propias incidencias");
        }

        // ADMIN puede cerrar cualquiera
        if (usuario.getRol() != Rol.ADMIN && usuario.getRol() != Rol.PROFESOR) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("No tienes permisos para cerrar incidencias");
        }

        Incidencia cerrada = incidenciaService.cerrar(id);
        return ResponseEntity.ok(cerrada);
    }
}