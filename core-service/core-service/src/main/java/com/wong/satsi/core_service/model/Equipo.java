package com.wong.satsi.core_service.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "equipos")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Equipo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Código único autogenerado para el activo (Ej: EQ-5f4d...)
    @Column(name = "codigo_inventario", nullable = false, unique = true, length = 50)
    private String codigoInventario;

    @Column(nullable = false, length = 50)
    private String tipo; // Ej: "Terminal POS", "Servidor", "Redes"

    @Column(length = 50)
    private String marca;

    @Column(length = 50)
    private String modelo;

    @Column(nullable = false, length = 30)
    private String estado; // Ej: "OPERATIVO", "MANTENIMIENTO", "DADO DE BAJA"

    @Column(name = "fecha_registro", updatable = false)
    private LocalDateTime fechaRegistro;

    // Relación: Muchos equipos pertenecen a una sola Sucursal
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "sucursal_id", nullable = false)
    private Sucursal sucursal;

    // Método automático antes de guardar en la Base de Datos
    @PrePersist
    protected void onCreate() {
        this.fechaRegistro = LocalDateTime.now();
        if (this.estado == null) {
            this.estado = "OPERATIVO";
        }
        if (this.codigoInventario == null) {
            // Genera un código único al instante
            this.codigoInventario = "EQ-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        }
    }
}