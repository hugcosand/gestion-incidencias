package com.gestion.incidencias.controller;

import com.gestion.incidencias.dto.RegistroDTO;
import com.gestion.incidencias.entity.Usuario;
import com.gestion.incidencias.entity.Rol;
import com.gestion.incidencias.service.UsuarioService;
import com.gestion.incidencias.util.UsuarioUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
@SecurityRequirement(name = "X-Email")
@Tag(name = "Usuarios", description = "CRUD de usuarios (solo ADMIN)")
public class UsuarioController {

    private final UsuarioService usuarioService;
    private final UsuarioUtil usuarioUtil;

    public UsuarioController(UsuarioService usuarioService, UsuarioUtil usuarioUtil) {
        this.usuarioService = usuarioService;
        this.usuarioUtil = usuarioUtil;
    }

    private void checkAdmin() {
        Usuario usuario = usuarioUtil.getUsuarioFromRequest();
        if (usuario.getRol() != Rol.ADMIN) {
            throw new RuntimeException("Acceso denegado: solo administradores");
        }
    }

    @GetMapping
    @Operation(summary = "Listar todos los usuarios")
    public List<Usuario> listarTodos() {
        checkAdmin();
        return usuarioService.obtenerTodos(); // Necesitas crear este método en UsuarioService
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener usuario por ID")
    public ResponseEntity<Usuario> obtenerPorId(@PathVariable Long id) {
        checkAdmin();
        Usuario usuario = usuarioService.obtenerPorId(id); // Necesitas crear este método
        if (usuario == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(usuario);
    }

    @PostMapping
    @Operation(summary = "Crear nuevo usuario")
    public ResponseEntity<Usuario> crear(@RequestBody Usuario usuario) {
        checkAdmin();
        Usuario nuevo = usuarioService.guardar(usuario); // Necesitas crear este método
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevo);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar usuario")
    public ResponseEntity<Usuario> actualizar(@PathVariable Long id, @RequestBody Usuario usuario) {
        checkAdmin();
        if (usuarioService.obtenerPorId(id) == null) {
            return ResponseEntity.notFound().build();
        }
        usuario.setId(id);
        Usuario actualizado = usuarioService.guardar(usuario);
        return ResponseEntity.ok(actualizado);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar usuario")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        checkAdmin();
        if (usuarioService.obtenerPorId(id) == null) {
            return ResponseEntity.notFound().build();
        }
        usuarioService.eliminar(id); // Necesitas crear este método
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/registro")
    @Operation(summary = "Registro público de nuevos usuarios", description = "Cualquier persona puede registrarse")
    public ResponseEntity<?> registrar(@Valid @RequestBody RegistroDTO registroDTO) {
        try {
            // Verificar si el email ya existe
            Usuario existente = usuarioService.obtenerPorEmail(registroDTO.getEmail());
            if (existente != null) {
                return ResponseEntity
                        .status(HttpStatus.BAD_REQUEST)
                        .body("El email ya está registrado");
            }

            // Crear nuevo usuario con rol PROFESOR por defecto
            Usuario nuevoUsuario = new Usuario();
            nuevoUsuario.setNombre(registroDTO.getNombre());
            nuevoUsuario.setEmail(registroDTO.getEmail());
            nuevoUsuario.setPassword(registroDTO.getPassword()); // Se encriptará en guardar()
            nuevoUsuario.setRol(Rol.PROFESOR); // Rol por defecto
            nuevoUsuario.setActivo(true); // Activo por defecto

            Usuario guardado = usuarioService.guardar(nuevoUsuario);

            // No devolver la contraseña en la respuesta
            guardado.setPassword(null);

            return ResponseEntity.status(HttpStatus.CREATED).body(guardado);

        } catch (Exception e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al registrar usuario: " + e.getMessage());
        }
    }
}