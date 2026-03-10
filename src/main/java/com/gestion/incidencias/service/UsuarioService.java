package com.gestion.incidencias.service;

import com.gestion.incidencias.entity.Rol;
import com.gestion.incidencias.entity.Usuario;
import com.gestion.incidencias.repository.UsuarioRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public Usuario obtenerPorEmail(String email) {
        return usuarioRepository.findByEmail(email).orElse(null);
    }

    public List<Usuario> obtenerTodos() {
        return usuarioRepository.findAll();
    }

    public Usuario obtenerPorId(Long id) {
        return usuarioRepository.findById(id).orElse(null);
    }

    public Usuario guardar(Usuario usuario) {

        if (usuario.getId() == null) {
            usuario.setPassword(passwordEncoder.encode(usuario.getPassword()));
        } else {
            Usuario existente = obtenerPorId(usuario.getId());
            if (existente != null && !usuario.getPassword().equals(existente.getPassword())) {

                usuario.setPassword(passwordEncoder.encode(usuario.getPassword()));
            }
        }
        return usuarioRepository.save(usuario);
    }

    public void eliminar(Long id) {
        usuarioRepository.deleteById(id);
    }

    public List<Usuario> filtrar(String nombre, String email, String rol) {
        List<Usuario> resultados = obtenerTodos();

        // Filtrar por nombre (búsqueda parcial)
        if (nombre != null && !nombre.trim().isEmpty()) {
            resultados = resultados.stream()
                    .filter(u -> u.getNombre().toLowerCase()
                            .contains(nombre.toLowerCase().trim()))
                    .collect(Collectors.toList());
        }

        // Filtrar por email (búsqueda parcial)
        if (email != null && !email.trim().isEmpty()) {
            resultados = resultados.stream()
                    .filter(u -> u.getEmail().toLowerCase()
                            .contains(email.toLowerCase().trim()))
                    .collect(Collectors.toList());
        }

        // Filtrar por rol
        if (rol != null && !rol.trim().isEmpty()) {
            try {
                Rol rolEnum = Rol.valueOf(rol);
                resultados = resultados.stream()
                        .filter(u -> u.getRol() == rolEnum)
                        .collect(Collectors.toList());
            } catch (IllegalArgumentException e) {
                // Rol no válido, no filtrar
            }
        }

        return resultados;
    }
}