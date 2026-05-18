package com.wong.satsi.iamservice.repository;

import com.wong.satsi.iamservice.model.Rol;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RolRepository extends JpaRepository<Rol, Long> {

    // Spring Boot escribirá el SQL por nosotros con solo nombrar bien el método:
    Optional<Rol> findByNombre(String nombre);
}