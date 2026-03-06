package com.gestion.incidencias.dto;

import com.gestion.incidencias.entity.Estado;
import com.gestion.incidencias.entity.TipoIncidencia;
import com.gestion.incidencias.entity.Solucion;
import com.gestion.incidencias.entity.Sensacion;
import java.time.LocalDateTime;

public class IncidenciaDTO {
    private String alumnoNombre;
    private String descripcion;
    private LocalDateTime fechaHoraIncidente;
    private TipoIncidencia tipoIncidencia;
    private Estado estado;
    private Solucion solucion;
    private Sensacion sensacion;

    // Getters y Setters
    public String getAlumnoNombre() {
        return alumnoNombre;
    }

    public void setAlumnoNombre(String alumnoNombre) {
        this.alumnoNombre = alumnoNombre;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public LocalDateTime getFechaHoraIncidente() {
        return fechaHoraIncidente;
    }

    public void setFechaHoraIncidente(LocalDateTime fechaHoraIncidente) {
        this.fechaHoraIncidente = fechaHoraIncidente;
    }

    public TipoIncidencia getTipoIncidencia() {
        return tipoIncidencia;
    }

    public void setTipoIncidencia(TipoIncidencia tipoIncidencia) {
        this.tipoIncidencia = tipoIncidencia;
    }

    public Estado getEstado() {
        return estado;
    }

    public void setEstado(Estado estado) {
        this.estado = estado;
    }

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