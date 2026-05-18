package com.wong.satsi.core_service.dto;

import lombok.Data;

@Data
public class TicketRequestDTO {
    private String titulo;
    private String descripcion;
    private Long usuarioId; // Temporalmente lo recibiremos así, luego lo sacaremos de forma segura del JWT
}