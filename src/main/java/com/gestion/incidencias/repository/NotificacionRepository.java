package com.gestion.incidencias.repository;

import com.gestion.incidencias.entity.Notificacion;
import com.gestion.incidencias.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NotificacionRepository extends JpaRepository<Notificacion, Long> {
    List<Notificacion> findByUsuarioAndLeidaFalseOrderByFechaCreacionDesc(Usuario usuario);

    //List<Notificacion> findByUsuarioOrderByFechaCreacionDesc(Usuario usuario);

    List<Notificacion> findByUsuario(Usuario usuario);

    @Modifying
    @Query("UPDATE Notificacion n SET n.leida = true WHERE n.usuario = ?1")
    void marcarTodasComoLeidas(Usuario usuario);

    long countByUsuarioAndLeidaFalse(Usuario usuario);
}