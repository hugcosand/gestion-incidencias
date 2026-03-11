package com.gestion.incidencias.service;

import com.gestion.incidencias.entity.Incidencia;
import com.gestion.incidencias.entity.Notificacion;
import com.gestion.incidencias.entity.Usuario;
import com.gestion.incidencias.repository.NotificacionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class NotificacionService {

    private final NotificacionRepository notificacionRepository;

    public NotificacionService(NotificacionRepository notificacionRepository) {
        this.notificacionRepository = notificacionRepository;
    }

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