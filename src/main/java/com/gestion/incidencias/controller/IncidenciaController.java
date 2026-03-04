package com.gestion.incidencias.controller;

import com.gestion.incidencias.entity.Incidencia;
import com.gestion.incidencias.service.IncidenciaService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/incidencias")
public class IncidenciaController {

    private final IncidenciaService incidenciaService;

    public IncidenciaController(IncidenciaService incidenciaService) {
        this.incidenciaService = incidenciaService;
    }

    // Obtener todas las incidencias
    @GetMapping
    public List<Incidencia> listarTodas() {
        return incidenciaService.obtenerTodas();
    }

    // Obtener una incidencia por ID
    @GetMapping("/{id}")
    public ResponseEntity<Incidencia> obtenerPorId(@PathVariable Long id) {
        Incidencia incidencia = incidenciaService.obtenerPorId(id);
        if (incidencia == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(incidencia);
    }

    // Crear una nueva incidencia
    @PostMapping
    public ResponseEntity<Incidencia> crear(@RequestBody Incidencia incidencia) {
        // La fecha de creación se asigna en el servicio
        Incidencia nueva = incidenciaService.guardar(incidencia);
        return ResponseEntity.status(HttpStatus.CREATED).body(nueva);
    }

    // Actualizar una incidencia existente
    @PutMapping("/{id}")
    public ResponseEntity<Incidencia> actualizar(@PathVariable Long id, @RequestBody Incidencia incidencia) {
        if (incidenciaService.obtenerPorId(id) == null) {
            return ResponseEntity.notFound().build();
        }
        incidencia.setId(id);
        Incidencia actualizada = incidenciaService.guardar(incidencia);
        return ResponseEntity.ok(actualizada);
    }

    // Eliminar una incidencia
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        if (incidenciaService.obtenerPorId(id) == null) {
            return ResponseEntity.notFound().build();
        }
        incidenciaService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}