package com.gestion.incidencias.service;

import com.gestion.incidencias.entity.Incidencia;
import com.gestion.incidencias.entity.Estado;
import com.gestion.incidencias.repository.IncidenciaRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class IncidenciaService {

    private final IncidenciaRepository incidenciaRepository;

    public IncidenciaService(IncidenciaRepository incidenciaRepository) {
        this.incidenciaRepository = incidenciaRepository;
    }

    public List<Incidencia> obtenerTodas() {
        return incidenciaRepository.findAll();
    }

    public Incidencia guardar(Incidencia incidencia) {
        incidencia.setFechaCreacion(LocalDate.now());
        return incidenciaRepository.save(incidencia);
    }

    public void eliminar(Long id) {
        incidenciaRepository.deleteById(id);
    }

    public Incidencia obtenerPorId(Long id) {
        return incidenciaRepository.findById(id).orElse(null);
    }

    public List<Incidencia> filtrar(String alumno, String fecha, String tipo,
                                    String estado, String sensacion) {

        // Empezamos con todas las incidencias
        List<Incidencia> resultados = obtenerTodas();

        // Filtrar por alumno (búsqueda parcial, case insensitive)
        if (alumno != null && !alumno.trim().isEmpty()) {
            resultados = resultados.stream()
                    .filter(i -> i.getAlumnoNombre().toLowerCase()
                            .contains(alumno.toLowerCase().trim()))
                    .collect(Collectors.toList());
        }

        // Filtrar por fecha exacta
        if (fecha != null && !fecha.trim().isEmpty()) {
            LocalDate fechaFiltro = LocalDate.parse(fecha);
            resultados = resultados.stream()
                    .filter(i -> i.getFechaHoraIncidente().toLocalDate().equals(fechaFiltro))
                    .collect(Collectors.toList());
        }

        // Filtrar por tipo
        if (tipo != null && !tipo.trim().isEmpty()) {
            resultados = resultados.stream()
                    .filter(i -> i.getTipoIncidencia().name().equals(tipo))
                    .collect(Collectors.toList());
        }

        // Filtrar por estado
        if (estado != null && !estado.trim().isEmpty()) {
            resultados = resultados.stream()
                    .filter(i -> i.getEstado().name().equals(estado))
                    .collect(Collectors.toList());
        }

        // Filtrar por sensación
        if (sensacion != null && !sensacion.trim().isEmpty()) {
            resultados = resultados.stream()
                    .filter(i -> i.getSensacion() != null &&
                            i.getSensacion().name().equals(sensacion))
                    .collect(Collectors.toList());
        }

        return resultados;
    }
}