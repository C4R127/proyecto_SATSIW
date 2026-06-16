package com.wong.satsi.iamservice.repository;

import com.wong.satsi.iamservice.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    // Estos métodos nos servirán para validar el login y para buscar usuarios por su correo o nombre de usuario:
    Optional<Usuario> findByUsername(String username);

    Optional<Usuario> findByEmail(String email);

    // Estos métodos nos servirán para validar el registro y evitar duplicados:
    boolean existsByEmail(String email);

    boolean existsByUsername(String username);
}