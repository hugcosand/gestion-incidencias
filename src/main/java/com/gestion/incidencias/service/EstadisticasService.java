package com.gestion.incidencias.service;

import com.gestion.incidencias.dto.EstadisticasDTO;
import com.gestion.incidencias.entity.Incidencia;
import com.gestion.incidencias.entity.Usuario;
import com.gestion.incidencias.repository.IncidenciaRepository;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class EstadisticasService {

    private final IncidenciaRepository incidenciaRepository;

    public EstadisticasService(IncidenciaRepository incidenciaRepository) {
        this.incidenciaRepository = incidenciaRepository;
    }

    // ── Estadísticas globales (ADMIN) ──────────────────────────────────────
    public EstadisticasDTO obtenerEstadisticas() {
        List<Incidencia> todas = incidenciaRepository.findAll();
        return calcularEstadisticas(todas);
    }

    // ── Estadísticas filtradas por profesor ────────────────────────────────
    public EstadisticasDTO obtenerEstadisticasPorProfesor(Usuario profesor) {
        List<Incidencia> suyas = incidenciaRepository.findAll().stream()
                .filter(i -> i.getProfesor() != null &&
                        i.getProfesor().getId().equals(profesor.getId()))
                .collect(Collectors.toList());
        return calcularEstadisticas(suyas);
    }

    // ── Lógica compartida ──────────────────────────────────────────────────
    private EstadisticasDTO calcularEstadisticas(List<Incidencia> incidencias) {

        long total = incidencias.size();

        // Agrupación por estado
        Map<String, Long> porEstado = incidencias.stream()
                .filter(i -> i.getEstado() != null)
                .collect(Collectors.groupingBy(
                        i -> i.getEstado().name(),
                        Collectors.counting()
                ));

        // Agrupación por tipo
        Map<String, Long> porTipo = incidencias.stream()
                .filter(i -> i.getTipoIncidencia() != null)
                .collect(Collectors.groupingBy(
                        i -> i.getTipoIncidencia().name(),
                        Collectors.counting()
                ));

        // Profesor con más incidencias
        String profesorMasActivo = incidencias.stream()
                .filter(i -> i.getProfesor() != null)
                .collect(Collectors.groupingBy(
                        i -> i.getProfesor().getNombre(),
                        Collectors.counting()
                ))
                .entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("Sin datos");

        // Top 3 alumnos con más incidencias
        List<String> alumnosConMasIncidencias = incidencias.stream()
                .filter(i -> i.getAlumnoNombre() != null)
                .collect(Collectors.groupingBy(
                        Incidencia::getAlumnoNombre,
                        Collectors.counting()
                ))
                .entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(3)
                .map(e -> e.getKey() + " (" + e.getValue() + ")")
                .collect(Collectors.toList());

        return new EstadisticasDTO(total, porEstado, porTipo,
                profesorMasActivo, alumnosConMasIncidencias);
    }
}