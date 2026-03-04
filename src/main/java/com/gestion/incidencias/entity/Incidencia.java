package com.gestion.incidencias.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Data
public class Incidencia {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String alumnoNombre;

    @Column(length = 500)
    private String descripcion;

    private LocalDate fechaCreacion;

    // Nuevo: fecha y hora del incidente
    private LocalDateTime fechaHoraIncidente;

    // Nuevo: sanción (texto libre)
    private String sancion;

    @Enumerated(EnumType.STRING)
    private Estado estado;

    @Enumerated(EnumType.STRING)
    private TipoIncidencia tipoIncidencia;

    @Enumerated(EnumType.STRING)
    private Solucion solucion;

    @Enumerated(EnumType.STRING)
    private Sensacion sensacion;

    // Relación con el profesor que crea la incidencia
    @ManyToOne
    @JoinColumn(name = "profesor_id", nullable = false)
    private Usuario profesor;
}