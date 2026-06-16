package com.wong.satsi.notification_service.controller;

import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private JavaMailSender mailSender;

    @PostMapping("/enviar")

    public String enviarCorreo(@RequestBody CorreoRequest request) {
        SimpleMailMessage mensaje = new SimpleMailMessage();

        mensaje.setTo(request.getDestinatario());
        mensaje.setSubject(request.getAsunto());
        mensaje.setText(request.getMensaje());
        mailSender.send(mensaje);

        return "Alerta enviada con éxito a: " + request.getDestinatario();
    }
}

// Clase de apoyo para recibir el JSON de Postman
@Data
class CorreoRequest {
    private String destinatario;
    private String asunto;
    private String mensaje;
}