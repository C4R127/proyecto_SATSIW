package com.wong.satsi.iamservice.controller;

import com.wong.satsi.iamservice.dto.LoginDTO;
import com.wong.satsi.iamservice.dto.RegistroUsuarioDTO;
import com.wong.satsi.iamservice.model.Usuario;
import com.wong.satsi.iamservice.repository.UsuarioRepository;
import com.wong.satsi.iamservice.security.JwtUtil;
import com.wong.satsi.iamservice.service.UsuarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UsuarioService usuarioService;
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    // Endpoint 1: Registro
    @PostMapping("/registro")
    public ResponseEntity<?> registrarUsuario(@RequestBody RegistroUsuarioDTO dto) {
        try {
            Usuario nuevoUsuario = new Usuario();
            nuevoUsuario.setUsername(dto.getUsername());
            nuevoUsuario.setPassword(dto.getPassword());
            nuevoUsuario.setEmail(dto.getEmail());

            Usuario usuarioGuardado = usuarioService.registrarUsuario(nuevoUsuario, dto.getNombreRol());
            return ResponseEntity.status(HttpStatus.CREATED).body("Usuario registrado exitosamente con ID: " + usuarioGuardado.getId());
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    // Endpoint 2: Login Inteligente (Soporta Username o Correo)
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginDTO dto) {

        // 1. Primero intentamos buscar por Username
        Optional<Usuario> usuarioOpt = usuarioRepository.findByUsername(dto.getUsername());

        // 2. NUEVO: Si no lo encuentra por Username, intentamos buscarlo por Email
        if (usuarioOpt.isEmpty()) {
            usuarioOpt = usuarioRepository.findByEmail(dto.getUsername());
        }

        // 3. Si definitivamente no existe bajo ninguno de los dos métodos, bloqueamos el paso
        if (usuarioOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Error: Usuario o correo no encontrado.");
        }

        Usuario usuario = usuarioOpt.get();

        // 4. Verificar que la contraseña ingresada coincida con la encriptada con Argon2
        if (!passwordEncoder.matches(dto.getPassword(), usuario.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Error: Contraseña incorrecta.");
        }

        // 5. Si todo está correcto, ordenamos a JwtUtil fabricar el Pase VIP
        String token = jwtUtil.generarToken(usuario.getUsername(), usuario.getRol().getNombre());

        // 6. Devolvemos el token al cliente
        return ResponseEntity.ok(token);
    }
}