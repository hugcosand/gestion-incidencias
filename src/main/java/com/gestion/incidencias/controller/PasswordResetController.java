package com.gestion.incidencias.controller;

import com.gestion.incidencias.entity.PasswordResetToken;
import com.gestion.incidencias.entity.Usuario;
import com.gestion.incidencias.repository.PasswordResetTokenRepository;
import com.gestion.incidencias.repository.UsuarioRepository;
import com.gestion.incidencias.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/password")
public class PasswordResetController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordResetTokenRepository tokenRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // 1. Solicitar recuperación
    @PostMapping("/forgot")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");

        Optional<Usuario> usuarioOpt = usuarioRepository.findByEmail(email);
        if (usuarioOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email no registrado"));
        }

        Usuario usuario = usuarioOpt.get();

        // Eliminar tokens anteriores
        tokenRepository.deleteByUsuarioId(usuario.getId());

        // Crear nuevo token
        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = new PasswordResetToken(token, usuario);
        tokenRepository.save(resetToken);

        // Enviar email
        String resetLink = "http://localhost:3000/#/reset-password?token=" + token;
        emailService.sendPasswordResetEmail(email, resetLink);

        return ResponseEntity.ok(Map.of("message", "Email de recuperación enviado"));
    }

    // 2. Validar token
    @PostMapping("/validate-token")
    public ResponseEntity<?> validateToken(@RequestBody Map<String, String> request) {
        String token = request.get("token");

        Optional<PasswordResetToken> tokenOpt = tokenRepository.findByToken(token);
        if (tokenOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Token inválido"));
        }

        PasswordResetToken resetToken = tokenOpt.get();

        if (resetToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            tokenRepository.delete(resetToken);
            return ResponseEntity.badRequest().body(Map.of("error", "Token expirado"));
        }

        return ResponseEntity.ok(Map.of("message", "Token válido"));
    }

    // 3. Restablecer contraseña
    @PostMapping("/reset")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        String token = request.get("token");
        String newPassword = request.get("password");

        Optional<PasswordResetToken> tokenOpt = tokenRepository.findByToken(token);
        if (tokenOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Token inválido"));
        }

        PasswordResetToken resetToken = tokenOpt.get();

        if (resetToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            tokenRepository.delete(resetToken);
            return ResponseEntity.badRequest().body(Map.of("error", "Token expirado"));
        }

        Usuario usuario = resetToken.getUsuario();
        usuario.setPassword(passwordEncoder.encode(newPassword));
        usuarioRepository.save(usuario);

        // Eliminar token usado
        tokenRepository.delete(resetToken);

        return ResponseEntity.ok(Map.of("message", "Contraseña actualizada correctamente"));
    }
}