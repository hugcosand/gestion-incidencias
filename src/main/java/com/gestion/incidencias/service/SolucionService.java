package com.gestion.incidencias.service;

import com.gestion.incidencias.entity.Solucion;
import com.gestion.incidencias.repository.SolucionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class SolucionService {

    private final SolucionRepository solucionRepository;

    public SolucionService(SolucionRepository solucionRepository) {
        this.solucionRepository = solucionRepository;
    }

    public List<Solucion> obtenerTodas() {
        return solucionRepository.findAll();
    }

    public List<Solucion> obtenerActivas() {
        return solucionRepository.findByActivoTrue();
    }

    public Solucion obtenerPorId(Long id) {
        return solucionRepository.findById(id).orElse(null);
    }

    @Transactional
    public Solucion guardar(Solucion solucion) {
        // Verificar si ya existe una con el mismo nombre
        if (solucion.getId() == null && solucionRepository.existsByNombre(solucion.getNombre())) {
            throw new RuntimeException("Ya existe una solución con ese nombre");
        }
        return solucionRepository.save(solucion);
    }

    @Transactional
    public void eliminar(Long id) {
        solucionRepository.deleteById(id);
    }

    @Transactional
    public Solucion desactivar(Long id) {
        Solucion solucion = obtenerPorId(id);
        if (solucion != null) {
            solucion.setActivo(false);
            return solucionRepository.save(solucion);
        }
        return null;
    }
}