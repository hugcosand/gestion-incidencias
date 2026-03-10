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

    // Relación con el profesor que crea la incidencia
    @ManyToOne
    @JoinColumn(name = "profesor_id", nullable = false)
    private Usuario profesor;

    @ManyToOne
    @JoinColumn(name = "solucion_id")
    private Solucion solucion;

    @ManyToOne
    @JoinColumn(name = "sensacion_id")
    private Sensacion sensacion;

    // Getters y Setters
    public Solucion getSolucion() {
        return solucion;
    }

    public void setSolucion(Solucion solucion) {
        this.solucion = solucion;
    }

    public Sensacion getSensacion() {
        return sensacion;
    }

    public void setSensacion(Sensacion sensacion) {
        this.sensacion = sensacion;
    }
}