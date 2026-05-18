package com.wong.satsi.iamservice.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/test")
public class TestController {

    // Una ruta cualquiera que usaremos como prueba
    @GetMapping("/saludo")
    public ResponseEntity<String> saludoSecreto() {
        return ResponseEntity.ok("¡Acceso concedido! Si ves este mensaje, tu token JWT es 100% válido y el guardia te dejó pasar.");
    }
}