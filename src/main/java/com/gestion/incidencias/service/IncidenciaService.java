package com.gestion.incidencias.service;

import com.gestion.incidencias.entity.Incidencia;
import com.gestion.incidencias.repository.IncidenciaRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

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
}