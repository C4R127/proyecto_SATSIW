package com.wong.satsi.core_service.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "ticket_timeline")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TicketTimeline {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tipo_evento", nullable = false, length = 50)
    private String tipoEvento; // Ej: "created", "status_change", "comment"

    @Column(nullable = false, length = 100)
    private String titulo; // Ej: "Ticket Creado", "Estado actualizado"

    @Column(columnDefinition = "TEXT")
    private String descripcion; // Ej: "El estado cambió a EN PROGRESO"

    @Column(nullable = false, updatable = false)
    private LocalDateTime fecha;

    @Column(length = 50)
    private String usuario; // Quién hizo la acción

    // Relación: Muchos eventos pertenecen a un solo Ticket
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ticket_id", nullable = false)
    @JsonIgnore // Esto evita un error de bucle infinito al convertirlo a JSON para React
    private Ticket ticket;

    @PrePersist
    protected void onCreate() {
        this.fecha = LocalDateTime.now();
    }
}