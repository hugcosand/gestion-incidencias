package com.gestion.incidencias.dto;

import java.util.Map;
import java.util.List;

public class EstadisticasDTO {

    private long totalIncidencias;
    private Map<String, Long> porEstado;
    private Map<String, Long> porTipo;
    private String profesorMasActivo;
    private List<String> alumnosConMasIncidencias;

    public EstadisticasDTO() {}

    public EstadisticasDTO(long totalIncidencias,
                           Map<String, Long> porEstado,
                           Map<String, Long> porTipo,
                           String profesorMasActivo,
                           List<String> alumnosConMasIncidencias) {
        this.totalIncidencias = totalIncidencias;
        this.porEstado = porEstado;
        this.porTipo = porTipo;
        this.profesorMasActivo = profesorMasActivo;
        this.alumnosConMasIncidencias = alumnosConMasIncidencias;
    }

    public long getTotalIncidencias() { return totalIncidencias; }
    public void setTotalIncidencias(long totalIncidencias) { this.totalIncidencias = totalIncidencias; }

    public Map<String, Long> getPorEstado() { return porEstado; }
    public void setPorEstado(Map<String, Long> porEstado) { this.porEstado = porEstado; }

    public Map<String, Long> getPorTipo() { return porTipo; }
    public void setPorTipo(Map<String, Long> porTipo) { this.porTipo = porTipo; }

    public String getProfesorMasActivo() { return profesorMasActivo; }
    public void setProfesorMasActivo(String profesorMasActivo) { this.profesorMasActivo = profesorMasActivo; }

    public List<String> getAlumnosConMasIncidencias() { return alumnosConMasIncidencias; }
    public void setAlumnosConMasIncidencias(List<String> alumnosConMasIncidencias) { this.alumnosConMasIncidencias = alumnosConMasIncidencias; }
}