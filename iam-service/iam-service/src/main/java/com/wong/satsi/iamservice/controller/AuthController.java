package com.wong.satsi.iamservice.controller;

import com.wong.satsi.iamservice.dto.RegistroUsuarioDTO;
import com.wong.satsi.iamservice.model.Usuario;
import com.wong.satsi.iamservice.service.UsuarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController // Indica que esta clase responderá a peticiones HTTP
@RequestMapping("/auth") // Todas las URLs de esta clase empezarán con /auth
@RequiredArgsConstructor
public class AuthController {

    private final UsuarioService usuarioService;

    // Endpoint para registrar un usuario: POST /auth/registro
    @PostMapping("/registro")
    public ResponseEntity<?> registrarUsuario(@RequestBody RegistroUsuarioDTO dto) {
        try {
            // Convertimos el DTO en la Entidad real que necesita la base de datos
            Usuario nuevoUsuario = new Usuario();
            nuevoUsuario.setUsername(dto.getUsername());
            nuevoUsuario.setPassword(dto.getPassword());
            nuevoUsuario.setEmail(dto.getEmail());

            // Llamamos al servicio para que aplique las reglas y lo guarde
            Usuario usuarioGuardado = usuarioService.registrarUsuario(nuevoUsuario, dto.getNombreRol());

            return ResponseEntity.status(HttpStatus.CREATED).body("Usuario registrado exitosamente con ID: " + usuarioGuardado.getId());

        } catch (RuntimeException e) {
            // Si el servicio lanza un error (ej: correo duplicado), lo atrapamos y lo devolvemos
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
}