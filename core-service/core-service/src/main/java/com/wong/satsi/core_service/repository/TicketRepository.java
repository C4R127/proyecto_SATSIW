package com.wong.satsi.core_service.repository;

import com.wong.satsi.core_service.model.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    // Solo con extender JpaRepository, Spring Boot ya nos regala todos los métodos de base de datos
}