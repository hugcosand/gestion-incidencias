package com.gestion.incidencias.repository;

import com.gestion.incidencias.entity.Incidencia;
import com.gestion.incidencias.entity.Estado;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface IncidenciaRepository extends JpaRepository<Incidencia, Long> {

    // NUEVOS MÉTODOS PARA FILTROS
    List<Incidencia> findByAlumnoNombreContainingIgnoreCase(String alumnoNombre);

    List<Incidencia> findByFechaCreacion(LocalDate fecha);

    List<Incidencia> findByEstado(Estado estado);

    List<Incidencia> findAllByOrderByFechaHoraIncidenteDesc();
}