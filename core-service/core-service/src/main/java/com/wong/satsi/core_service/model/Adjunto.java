package com.wong.satsi.core_service.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "adjuntos")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Adjunto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nombre_archivo", nullable = false)
    private String nombreArchivo; // Ej: "pantalla_azul.png"

    @Column(name = "tipo_archivo", nullable = false, length = 50)
    private String tipoArchivo; // Ej: "image/png" o "application/pdf"

    @Column(name = "ruta_archivo", nullable = false, length = 500)
    private String rutaArchivo; // Dónde está guardado físicamente en la PC

    @Column(name = "fecha_subida", updatable = false)
    private LocalDateTime fechaSubida;

    // Relación: Muchos adjuntos pueden pertenecer a un solo Ticket
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ticket_id", nullable = false)
    @JsonIgnore
    private Ticket ticket;

    @PrePersist
    protected void onCreate() {
        this.fechaSubida = LocalDateTime.now();
    }
}