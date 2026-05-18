package com.wong.satsi.iamservice.dto;

import lombok.Data;

@Data // Lombok nos genera los Getters y Setters automáticamente
public class RegistroUsuarioDTO {
    // Estos son los únicos campos que el usuario enviará desde Postman o el Frontend
    private String username;
    private String password;
    private String email;
    private String nombreRol; // Ej: "ADMIN", "PACIENTE", "DOCTOR"
}