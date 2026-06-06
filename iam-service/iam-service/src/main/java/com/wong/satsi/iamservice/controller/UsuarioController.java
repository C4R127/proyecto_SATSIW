package com.wong.satsi.iamservice.controller;

import com.wong.satsi.iamservice.dto.RegistroUsuarioDTO;
import com.wong.satsi.iamservice.model.Usuario;
import com.wong.satsi.iamservice.service.UsuarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioService usuarioService;

    // 1. Endpoint para que el SysAdmin vea a todo el personal
    @GetMapping
    public ResponseEntity<List<Usuario>> listarUsuarios() {
        return ResponseEntity.ok(usuarioService.obtenerTodosLosUsuarios());
    }

    // 2. Endpoint para que el SysAdmin registre nuevos empleados
    @PostMapping
    public ResponseEntity<?> crearUsuario(@RequestBody RegistroUsuarioDTO dto) {
        try {
            Usuario nuevoUsuario = new Usuario();
            nuevoUsuario.setUsername(dto.getUsername());
            nuevoUsuario.setPassword(dto.getPassword());
            nuevoUsuario.setEmail(dto.getEmail());

            // Usamos tu método existente que ya encripta la contraseña y asigna el rol
            Usuario usuarioGuardado = usuarioService.registrarUsuario(nuevoUsuario, dto.getNombreRol());

            return ResponseEntity.status(HttpStatus.CREATED).body(usuarioGuardado);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
}