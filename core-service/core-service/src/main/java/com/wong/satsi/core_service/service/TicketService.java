package com.wong.satsi.core_service.service;

import com.wong.satsi.core_service.dto.TicketRequestDTO;
import com.wong.satsi.core_service.model.Ticket;
import com.wong.satsi.core_service.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TicketService {

    private final TicketRepository ticketRepository;

    public Ticket crearTicket(TicketRequestDTO dto, String username) {
        Ticket nuevoTicket = new Ticket();
        nuevoTicket.setTitulo(dto.getTitulo());
        nuevoTicket.setDescripcion(dto.getDescripcion());
        nuevoTicket.setUsuarioUsername(username); // Asignamos el usuario autenticado de forma segura

        return ticketRepository.save(nuevoTicket);
    }

    // Importa java.util.List en la parte superior si no está importado
    public List<Ticket> obtenerTodosLosTickets() {
        return ticketRepository.findAll();
    }

    // Método para cambiar el estado de un ticket
    public Ticket actualizarEstado(Long id, String nuevoEstado) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error: Ticket no encontrado con ID: " + id));

        ticket.setEstado(nuevoEstado);
        return ticketRepository.save(ticket);
    }

}