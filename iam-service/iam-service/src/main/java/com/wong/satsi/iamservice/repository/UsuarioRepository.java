package com.wong.satsi.iamservice.repository;

import com.wong.satsi.iamservice.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    // Necesitaremos esto para el login:
    Optional<Usuario> findByUsername(String username);

    Optional<Usuario> findByEmail(String email);

    // Necesitaremos esto para validar que no se repitan correos al registrar:
    boolean existsByEmail(String email);

    boolean existsByUsername(String username);
}