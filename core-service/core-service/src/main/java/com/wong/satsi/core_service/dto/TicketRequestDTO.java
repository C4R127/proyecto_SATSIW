package com.wong.satsi.core_service.dto;

import lombok.Data;

@Data
public class TicketRequestDTO {
    private String titulo;
    private String descripcion;
    private Long equipoId;     // <-- Cambiado de String a Long
    private String prioridad;
    private Long sucursalId;   // <-- Cambiado de String a Long
}