package com.gestion.incidencias;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class GenerarPassword {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

        String passAdmin = "admin";
        String passProfesor = "1234";

        System.out.println("admin: " + encoder.encode(passAdmin));
        System.out.println("1234: " + encoder.encode(passProfesor));
    }
}