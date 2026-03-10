package com.gestion.incidencias.service;

import com.gestion.incidencias.entity.Sensacion;
import com.gestion.incidencias.repository.SensacionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class SensacionService {

    private final SensacionRepository sensacionRepository;

    public SensacionService(SensacionRepository sensacionRepository) {
        this.sensacionRepository = sensacionRepository;
    }

    public List<Sensacion> obtenerTodas() {
        return sensacionRepository.findAll();
    }

    public List<Sensacion> obtenerActivas() {
        return sensacionRepository.findByActivoTrue();
    }

    public Sensacion obtenerPorId(Long id) {
        return sensacionRepository.findById(id).orElse(null);
    }

    @Transactional
    public Sensacion guardar(Sensacion sensacion) {
        // Verificar si ya existe una con el mismo nombre
        if (sensacion.getId() == null && sensacionRepository.existsByNombre(sensacion.getNombre())) {
            throw new RuntimeException("Ya existe una sensacion con ese nombre");
        }
        return sensacionRepository.save(sensacion);
    }

    @Transactional
    public void eliminar(Long id) {
        sensacionRepository.deleteById(id);
    }

    @Transactional
    public Sensacion desactivar(Long id) {
        Sensacion sensacion = obtenerPorId(id);
        if (sensacion != null) {
            sensacion.setActivo(false);
            return sensacionRepository.save(sensacion);
        }
        return null;
    }
}