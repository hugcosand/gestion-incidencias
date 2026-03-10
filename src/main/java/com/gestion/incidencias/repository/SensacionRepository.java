package com.gestion.incidencias.repository;

import com.gestion.incidencias.entity.Sensacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SensacionRepository extends JpaRepository<Sensacion, Long>{
    List<Sensacion> findByActivoTrue();
    boolean existsByNombre(String nombre);
}