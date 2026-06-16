package com.wong.satsi.iamservice.dto;

import lombok.Data;

@Data // Lombok nos genera los Getters y Setters automáticamente
public class RegistroUsuarioDTO {
    private String username;
    private String password;
    private String email;
    private String nombreRol;
}