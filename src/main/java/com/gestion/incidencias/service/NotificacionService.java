package com.gestion.incidencias.service;

import com.gestion.incidencias.entity.Incidencia;
import com.gestion.incidencias.entity.Notificacion;
import com.gestion.incidencias.entity.Usuario;
import com.gestion.incidencias.repository.NotificacionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

@Service
public class NotificacionService {

    private final NotificacionRepository notificacionRepository;

    public NotificacionService(NotificacionRepository notificacionRepository) {
        this.notificacionRepository = notificacionRepository;
    }

    /**
     * Compara dos objetos y devuelve true si son diferentes
     */
    private boolean sonDiferentes(Object obj1, Object obj2) {
        return !Objects.equals(obj1, obj2);
    }

    /**
     * Formatea un cambio para el mensaje
     */
    private String formatearCambio(String campo, Object valorAnterior, Object valorNuevo) {
        if (valorAnterior == null && valorNuevo == null) return "";
        if (valorAnterior == null) return String.format("%s: → %s", campo, valorNuevo);
        if (valorNuevo == null) return String.format("%s: %s → (vacío)", campo, valorAnterior);
        return String.format("%s: %s → %s", campo, valorAnterior, valorNuevo);
    }

    /**
     * Crea notificación con detalle de cambios
     */
    @Transactional
    public void crearNotificacionIncidenciaActualizada(Incidencia incidenciaAntigua,
                                                       Incidencia incidenciaNueva,
                                                       Usuario usuarioQueActualiza) {

        // Solo crear notificación si la incidencia tiene profesor asignado
        // y quien actualiza NO es el dueño
        if (incidenciaNueva.getProfesor() == null ||
                incidenciaNueva.getProfesor().getId().equals(usuarioQueActualiza.getId())) {
            return;
        }

        StringBuilder cambios = new StringBuilder();
        int contadorCambios = 0;

        // Comparar alumno
        if (sonDiferentes(incidenciaAntigua.getAlumnoNombre(), incidenciaNueva.getAlumnoNombre())) {
            if (contadorCambios > 0) cambios.append(" • ");
            cambios.append(formatearCambio("Alumno",
                    incidenciaAntigua.getAlumnoNombre(),
                    incidenciaNueva.getAlumnoNombre()));
            contadorCambios++;
        }

        // Comparar descripción (solo indicar que cambió)
        if (sonDiferentes(incidenciaAntigua.getDescripcion(), incidenciaNueva.getDescripcion())) {
            if (contadorCambios > 0) cambios.append(" • ");
            cambios.append("Descripción actualizada");
            contadorCambios++;
        }

        // Comparar tipo
        if (sonDiferentes(incidenciaAntigua.getTipoIncidencia(), incidenciaNueva.getTipoIncidencia())) {
            if (contadorCambios > 0) cambios.append(" • ");
            cambios.append(formatearCambio("Tipo",
                    incidenciaAntigua.getTipoIncidencia(),
                    incidenciaNueva.getTipoIncidencia()));
            contadorCambios++;
        }

        // Comparar estado
        if (sonDiferentes(incidenciaAntigua.getEstado(), incidenciaNueva.getEstado())) {
            if (contadorCambios > 0) cambios.append(" • ");
            cambios.append(formatearCambio("Estado",
                    incidenciaAntigua.getEstado(),
                    incidenciaNueva.getEstado()));
            contadorCambios++;
        }

        // Comparar solución
        String solucionAntigua = incidenciaAntigua.getSolucion() != null ?
                incidenciaAntigua.getSolucion().getNombre() : null;
        String solucionNueva = incidenciaNueva.getSolucion() != null ?
                incidenciaNueva.getSolucion().getNombre() : null;

        if (sonDiferentes(solucionAntigua, solucionNueva)) {
            if (contadorCambios > 0) cambios.append(" • ");
            cambios.append(formatearCambio("Solución", solucionAntigua, solucionNueva));
            contadorCambios++;
        }

        // Comparar sensación
        String sensacionAntigua = incidenciaAntigua.getSensacion() != null ?
                incidenciaAntigua.getSensacion().getNombre() : null;
        String sensacionNueva = incidenciaNueva.getSensacion() != null ?
                incidenciaNueva.getSensacion().getNombre() : null;

        if (sonDiferentes(sensacionAntigua, sensacionNueva)) {
            if (contadorCambios > 0) cambios.append(" • ");
            cambios.append(formatearCambio("Sensación", sensacionAntigua, sensacionNueva));
            contadorCambios++;
        }

        // Comparar fecha/hora
        if (sonDiferentes(incidenciaAntigua.getFechaHoraIncidente(),
                incidenciaNueva.getFechaHoraIncidente())) {
            if (contadorCambios > 0) cambios.append(" • ");
            cambios.append("Fecha/Hora modificada");
            contadorCambios++;
        }

        // Si no hay cambios, no crear notificación
        if (contadorCambios == 0) return;

        // Construir mensaje final
        String mensaje = String.format("Incidencia de %s modificada por %s:\n%s",
                incidenciaNueva.getAlumnoNombre(),
                usuarioQueActualiza.getNombre(),
                cambios.toString());

        // Crear notificación
        Notificacion notificacion = new Notificacion();
        notificacion.setUsuario(incidenciaNueva.getProfesor());
        notificacion.setTipo("INCIDENCIA_ACTUALIZADA");
        notificacion.setIncidenciaId(incidenciaNueva.getId());
        notificacion.setAlumnoNombre(incidenciaNueva.getAlumnoNombre());
        notificacion.setMensaje(mensaje);
        notificacion.setFechaCreacion(LocalDateTime.now());
        notificacion.setLeida(false);

        notificacionRepository.save(notificacion);
    }

    /**
     * Método original para compatibilidad (sin detalle)
     */
    @Transactional
    public void crearNotificacionIncidenciaActualizada(Incidencia incidencia, Usuario usuarioQueActualiza) {
        if (incidencia.getProfesor() != null &&
                !incidencia.getProfesor().getId().equals(usuarioQueActualiza.getId())) {

            Notificacion notificacion = new Notificacion();
            notificacion.setUsuario(incidencia.getProfesor());
            notificacion.setTipo("INCIDENCIA_ACTUALIZADA");
            notificacion.setIncidenciaId(incidencia.getId());
            notificacion.setAlumnoNombre(incidencia.getAlumnoNombre());
            notificacion.setMensaje(String.format(
                    "La incidencia de %s ha sido actualizada por %s",
                    incidencia.getAlumnoNombre(),
                    usuarioQueActualiza.getNombre()
            ));
            notificacion.setFechaCreacion(LocalDateTime.now());
            notificacion.setLeida(false);

            notificacionRepository.save(notificacion);
        }
    }

    public List<Notificacion> obtenerNoLeidas(Usuario usuario) {
        return notificacionRepository.findByUsuarioAndLeidaFalseOrderByFechaCreacionDesc(usuario);
    }

    public long contarNoLeidas(Usuario usuario) {
        return notificacionRepository.countByUsuarioAndLeidaFalse(usuario);
    }

    @Transactional
    public void marcarComoLeidas(Usuario usuario) {
        notificacionRepository.marcarTodasComoLeidas(usuario);
    }
}