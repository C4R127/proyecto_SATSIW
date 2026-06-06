package com.wong.satsi.core_service.controller;

import com.wong.satsi.core_service.dto.TicketRequestDTO;
import com.wong.satsi.core_service.model.Ticket;
import com.wong.satsi.core_service.service.TicketService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // RESTAURADO
public class TicketController {

    private final TicketService ticketService;

    // Endpoint para crear un nuevo ticket
    // Importa org.springframework.security.core.Authentication;
    @PostMapping
    public ResponseEntity<Ticket> crearTicket(@RequestBody TicketRequestDTO dto, Authentication authentication) {
        // Extraemos el username del token validado por el filtro
        String username = authentication.getName();

        Ticket nuevoTicket = ticketService.crearTicket(dto, username);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevoTicket);
    }

    // Importa java.util.List en la parte superior si no está importado
    // Endpoint para listar todos los tickets
    @GetMapping
    public ResponseEntity<List<Ticket>> listarTickets() {
        List<Ticket> tickets = ticketService.obtenerTodosLosTickets();
        return ResponseEntity.ok(tickets);
    }

    // 1. Modifica el PutMapping existente para extraer el usuario:
    @PutMapping("/{id}/estado")
    public ResponseEntity<Ticket> actualizarEstado(@PathVariable Long id, @RequestParam String estado, Authentication authentication) {
        try {
            String username = authentication.getName();
            // Le pasamos el username a tu servicio actualizado
            Ticket ticketActualizado = ticketService.actualizarEstado(id, estado, username);
            return ResponseEntity.ok(ticketActualizado);
        } catch (RuntimeException e) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.NOT_FOUND).body(null);
        }
    }

    // NUEVO: Endpoint PUT para recibir la actualización desde React
    @PutMapping("/{id}")
    public ResponseEntity<Ticket> actualizarTicket(@PathVariable Long id, @RequestBody Ticket ticket) {
        return ResponseEntity.ok(ticketService.actualizarTicket(id, ticket));
    }

    // 2. Añade este NUEVO endpoint para recibir los comentarios desde React:
    @PostMapping("/{id}/comments")
    public ResponseEntity<Ticket> agregarComentario(@PathVariable Long id, @RequestBody java.util.Map<String, String> payload, Authentication authentication) {
        String username = authentication.getName();
        String message = payload.get("message"); // El frontend envía {"message": "texto..."}

        Ticket ticketActualizado = ticketService.agregarComentario(id, message, username);
        return ResponseEntity.ok(ticketActualizado);
    }

    // Endpoint para subir evidencias (fotos/logs)
    @PostMapping(value = "/{id}/adjuntos", consumes = "multipart/form-data")
    public ResponseEntity<Ticket> subirEvidencia(
            @PathVariable Long id,
            @RequestParam("archivo") MultipartFile archivo) {

        Ticket ticketActualizado = ticketService.subirEvidencia(id, archivo);
        return ResponseEntity.ok(ticketActualizado);
    }

    // NUEVO: Endpoint para servir la imagen al navegador de React
    @GetMapping("/evidencia/{nombreArchivo:.+}")
    public ResponseEntity<Resource> verEvidencia(@PathVariable String nombreArchivo) {
        try {
            Path rutaArchivo = Paths.get("uploads/").resolve(nombreArchivo).normalize();
            Resource recurso = new UrlResource(rutaArchivo.toUri());

            if (recurso.exists()) {
                return ResponseEntity.ok()
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + recurso.getFilename() + "\"")
                        .body(recurso);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

}