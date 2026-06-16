package com.wong.satsi.iamservice.repository;

import com.wong.satsi.iamservice.model.Rol;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RolRepository extends JpaRepository<Rol, Long> {

    // Este método nos servirá para asignar el rol al usuario al momento de registrarlo
    Optional<Rol> findByNombre(String nombre);
}