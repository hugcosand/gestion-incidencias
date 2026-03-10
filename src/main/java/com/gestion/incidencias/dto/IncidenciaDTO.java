package com.gestion.incidencias.dto;

import com.gestion.incidencias.entity.Estado;
import com.gestion.incidencias.entity.TipoIncidencia;

import java.time.LocalDateTime;

public class IncidenciaDTO {
    private String alumnoNombre;
    private String descripcion;
    private LocalDateTime fechaHoraIncidente;
    private TipoIncidencia tipoIncidencia;
    private Estado estado;
    private Long solucionId;
    private Long sensacionId;

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

    // Getters y Setters
    public Long getSolucionId() {
        return solucionId;
    }

    public void setSolucionId(Long solucionId) {
        this.solucionId = solucionId;
    }

    public Long getSensacionId() {
        return sensacionId;
    }

    public void setSensacionId(Long sensacionId) {
        this.sensacionId = sensacionId;
    }
}