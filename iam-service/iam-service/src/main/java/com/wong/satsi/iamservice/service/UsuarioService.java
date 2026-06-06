package com.wong.satsi.iamservice.service;

import com.wong.satsi.iamservice.model.Rol;
import com.wong.satsi.iamservice.model.Usuario;
import com.wong.satsi.iamservice.repository.RolRepository;
import com.wong.satsi.iamservice.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final PasswordEncoder passwordEncoder; // Inyectamos la herramienta que acabamos de crear

    public Usuario registrarUsuario(Usuario nuevoUsuario, String nombreRol) {

        if (usuarioRepository.existsByUsername(nuevoUsuario.getUsername())) {
            throw new RuntimeException("Error: El nombre de usuario ya está en uso.");
        }

        if (usuarioRepository.existsByEmail(nuevoUsuario.getEmail())) {
            throw new RuntimeException("Error: El correo electrónico ya está registrado.");
        }

        Rol rol = rolRepository.findByNombre(nombreRol)
                .orElseThrow(() -> new RuntimeException("Error: El rol especificado no existe."));

        nuevoUsuario.setRol(rol);

        // ¡Aquí ocurre la magia de la encriptación!
        String contrasenaEncriptada = passwordEncoder.encode(nuevoUsuario.getPassword());
        nuevoUsuario.setPassword(contrasenaEncriptada);

        return usuarioRepository.save(nuevoUsuario);
    }

        // NUEVO: Método para listar todos los usuarios
        public java.util.List<Usuario> obtenerTodosLosUsuarios() {
            return usuarioRepository.findAll();
        }
}
