package com.wong.satsi.core_service.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "tickets")
@Data // Lombok genera los Getters y Setters automáticamente
@NoArgsConstructor
@AllArgsConstructor
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String titulo;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String descripcion;

    @Column(name = "categoria")
    private String categoria;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "equipo_id")
    private Equipo equipo;

    @Column(nullable = false, length = 20)
    private String prioridad;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "sucursal_id", nullable = false)
    private Sucursal sucursal;

    @Column(nullable = false, length = 30)
    private String estado; // Ej: "ABIERTO", "EN_PROGRESO", "CERRADO"

    @Column(name = "usuario_username", nullable = false, length = 50)
    private String usuarioUsername;

    @Column(name = "fecha_creacion", updatable = false)
    private LocalDateTime fechaCreacion;

    @OneToMany(mappedBy = "ticket", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private List<TicketTimeline> timeline = new ArrayList<>();

    @OneToMany(mappedBy = "ticket", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private List<Adjunto> adjuntos = new ArrayList<>();

    @Column(name = "alerta_vencimiento_enviada")
    private Boolean alertaVencimientoEnviada = false;

    // Esto se ejecuta automáticamente justo antes de guardar en la base de datos
    @PrePersist
    protected void onCreate() {
        this.fechaCreacion = LocalDateTime.now();
        if (this.estado == null) {
            this.estado = "ABIERTO"; // Por defecto, todo ticket nace con estado ABIERTO
        }
    }
}