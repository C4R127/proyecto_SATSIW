package com.wong.satsi.core_service.controller;

import com.wong.satsi.core_service.dto.TicketRequestDTO;
import com.wong.satsi.core_service.model.Ticket;
import com.wong.satsi.core_service.service.TicketService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final TicketService ticketService;

    // Endpoint para crear un nuevo ticket
    @PostMapping
    public ResponseEntity<Ticket> crearTicket(@RequestBody TicketRequestDTO dto) {
        Ticket nuevoTicket = ticketService.crearTicket(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevoTicket);
    }

    // Importa java.util.List en la parte superior si no está importado
    // Endpoint para listar todos los tickets
    @GetMapping
    public ResponseEntity<List<Ticket>> listarTickets() {
        List<Ticket> tickets = ticketService.obtenerTodosLosTickets();
        return ResponseEntity.ok(tickets);
    }

    // Endpoint para actualizar el estado de un ticket
    @PutMapping("/{id}/estado")
    public ResponseEntity<Ticket> actualizarEstado(@PathVariable Long id, @RequestParam String estado) {
        try {
            Ticket ticketActualizado = ticketService.actualizarEstado(id, estado);
            return ResponseEntity.ok(ticketActualizado);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }

}