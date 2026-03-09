package com.gestion.incidencias.repository;

import com.gestion.incidencias.entity.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;
import java.util.Optional;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
    Optional<PasswordResetToken> findByToken(String token);

    @Transactional
    @Modifying
    @Query("DELETE FROM PasswordResetToken t WHERE t.usuario.id = ?1")
    void deleteByUsuarioId(Long usuarioId);
}