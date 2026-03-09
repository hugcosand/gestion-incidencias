package com.gestion.incidencias.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendPasswordResetEmail(String to, String resetLink) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Recuperación de contraseña - Gestión de Incidencias");
        message.setText("Hola,\n\n" +
                "Has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace:\n\n" +
                resetLink + "\n\n" +
                "Este enlace expirará en 24 horas.\n\n" +
                "Si no solicitaste esto, ignora este correo.\n\n" +
                "Saludos,\nEquipo de Gestión de Incidencias");

        mailSender.send(message);
    }
}