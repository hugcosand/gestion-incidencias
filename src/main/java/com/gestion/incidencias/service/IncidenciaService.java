package com.gestion.incidencias.service;

import com.gestion.incidencias.entity.Incidencia;
import com.gestion.incidencias.repository.IncidenciaRepository;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.text.Normalizer;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class IncidenciaService {

    private static final Logger log = LoggerFactory.getLogger(IncidenciaService.class);
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

    // NUEVO: Método con filtro por hora
    public List<Incidencia> filtrar(String alumno, String fecha, String hora,
                                    String tipo, String estado, String sensacion,
                                    String solucion, String profesor) {

        List<Incidencia> resultados = obtenerTodas();

        // Filtrar por alumno (SIN ACENTOS)
        if (alumno != null && !alumno.trim().isEmpty()) {
            String alumnoNormalizado = normalizarTexto(alumno);
            resultados = resultados.stream()
                    .filter(i -> {
                        String nombreAlumnoNormalizado = normalizarTexto(i.getAlumnoNombre());
                        return nombreAlumnoNormalizado != null &&
                                nombreAlumnoNormalizado.contains(alumnoNormalizado);
                    })
                    .collect(Collectors.toList());
        }

        // Filtrar por fecha
        if (fecha != null && !fecha.trim().isEmpty()) {
            try {
                LocalDate fechaFiltro = LocalDate.parse(fecha);
                resultados = resultados.stream()
                        .filter(i -> i.getFechaHoraIncidente().toLocalDate().equals(fechaFiltro))
                        .collect(Collectors.toList());
            } catch (Exception e) {
                log.warn("Formato de fecha inválido: {}", fecha);
            }
        }

        // Filtrar por hora
        if (hora != null && !hora.trim().isEmpty()) {
            try {
                String[] partesHora = hora.split(":");
                int horaBuscada = Integer.parseInt(partesHora[0]);

                if (partesHora.length > 1) {
                    // Búsqueda exacta (hora y minuto)
                    int minutoBuscado = Integer.parseInt(partesHora[1]);
                    resultados = resultados.stream()
                            .filter(i -> {
                                LocalDateTime fechaHora = i.getFechaHoraIncidente();
                                return fechaHora.getHour() == horaBuscada &&
                                        fechaHora.getMinute() == minutoBuscado;
                            })
                            .collect(Collectors.toList());
                } else {
                    // Búsqueda por hora exacta (ignorando minutos)
                    resultados = resultados.stream()
                            .filter(i -> i.getFechaHoraIncidente().getHour() == horaBuscada)
                            .collect(Collectors.toList());
                }
            } catch (NumberFormatException e) {
                log.warn("Formato de hora inválido: {}", hora);
            }
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
                            i.getSensacion().getNombre().toLowerCase()
                                    .contains(sensacion.toLowerCase().trim()))
                    .collect(Collectors.toList());
        }

        // Filtrar por solución
        if (solucion != null && !solucion.trim().isEmpty()) {
            resultados = resultados.stream()
                    .filter(i -> i.getSolucion() != null &&
                            i.getSolucion().getNombre().toLowerCase()
                                    .contains(solucion.toLowerCase().trim()))
                    .collect(Collectors.toList());
        }

        // Filtrar por profesor (SIN ACENTOS)
        if (profesor != null && !profesor.trim().isEmpty()) {
            String profesorNormalizado = normalizarTexto(profesor);
            resultados = resultados.stream()
                    .filter(i -> i.getProfesor() != null &&
                            normalizarTexto(i.getProfesor().getNombre())
                                    .contains(profesorNormalizado))
                    .collect(Collectors.toList());
        }

        return resultados;
    }

    public List<Incidencia> filtrar(String alumno, String fecha, String tipo,
                                    String estado, String sensacion, String solucion,
                                    String profesor) {
        return filtrar(alumno, fecha, null, tipo, estado, sensacion, solucion, profesor);
    }

    private String normalizarTexto(String texto) {
        if (texto == null || texto.trim().isEmpty()) return null;

        // Normalizar y eliminar diacríticos (acentos)
        String normalized = Normalizer.normalize(texto, Normalizer.Form.NFD);
        Pattern pattern = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");
        String sinAcentos = pattern.matcher(normalized).replaceAll("");

        // Convertir a minúsculas y trim
        return sinAcentos.toLowerCase().trim();
    }
}