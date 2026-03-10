package com.gestion.incidencias.repository;

import com.gestion.incidencias.entity.Solucion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SolucionRepository extends JpaRepository<Solucion, Long> {
    List<Solucion> findByActivoTrue();
    boolean existsByNombre(String nombre);
}