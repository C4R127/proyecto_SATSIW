package com.wong.satsi.core_service.service;

import com.wong.satsi.core_service.dto.TicketRequestDTO;
import com.wong.satsi.core_service.model.Equipo;
import com.wong.satsi.core_service.model.Sucursal;
import com.wong.satsi.core_service.model.Ticket;
import com.wong.satsi.core_service.repository.EquipoRepository;
import com.wong.satsi.core_service.repository.SucursalRepository;
import com.wong.satsi.core_service.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate; // <-- IMPORTAMOS LA CLASE AQUÍ

import org.springframework.web.multipart.MultipartFile;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TicketService {

    private final TicketRepository ticketRepository;
    private final SucursalRepository sucursalRepository; // <-- AÑADIR ESTO
    private final EquipoRepository equipoRepository;     // <-- AÑADIR ESTO
    private final RestTemplate restTemplate; // <-- AÑADIMOS EL COMUNICADOR AQUÍ

    public Ticket crearTicket(TicketRequestDTO dto, String username) {
        Ticket nuevoTicket = new Ticket();
        nuevoTicket.setTitulo(dto.getTitulo());
        nuevoTicket.setDescripcion(dto.getDescripcion());

        // Guardamos la prioridad y la NUEVA CATEGORÍA
        nuevoTicket.setPrioridad(dto.getPrioridad());
        nuevoTicket.setCategoria(dto.getCategoria());

        // 1. Buscamos el Equipo solo si el Frontend nos envió un ID (ahora es opcional)
        if (dto.getEquipoId() != null) {
            Equipo equipo = equipoRepository.findById(dto.getEquipoId())
                    .orElseThrow(() -> new RuntimeException("Equipo no encontrado con ID: " + dto.getEquipoId()));
            nuevoTicket.setEquipo(equipo);
        } else {
            nuevoTicket.setEquipo(null); // Si no envían equipo, lo dejamos vacío de forma segura
        }

        // 2. Buscamos la Sucursal real en la base de datos
        Sucursal sucursal = sucursalRepository.findById(dto.getSucursalId())
                .orElseThrow(() -> new RuntimeException("Sucursal no encontrada con ID: " + dto.getSucursalId()));
        nuevoTicket.setSucursal(sucursal);


        nuevoTicket.setUsuarioUsername(username); // Asignamos el usuario autenticado de forma segura

        // --- REGISTRAR EL EVENTO DE CREACIÓN EN EL TIMELINE ---
        com.wong.satsi.core_service.model.TicketTimeline eventoCreacion = new com.wong.satsi.core_service.model.TicketTimeline();
        eventoCreacion.setTipoEvento("created");
        eventoCreacion.setTitulo("Ticket Creado");
        eventoCreacion.setDescripcion("El usuario reportó la incidencia con prioridad " + dto.getPrioridad());
        eventoCreacion.setUsuario(username);
        eventoCreacion.setTicket(nuevoTicket); // Enlazamos el evento al ticket

        // Añadimos el evento a la lista del ticket
        nuevoTicket.getTimeline().add(eventoCreacion);

        // 1. Guardamos el ticket y lo almacenamos en una variable para tener su ID autogenerado
        Ticket ticketGuardado = ticketRepository.save(nuevoTicket);

        // 2. --- NOTIFICACIÓN AUTOMÁTICA AL MICROSERVICIO 4 ---
        java.util.Map<String, String> correoRequest = new java.util.HashMap<>();
        correoRequest.put("destinatario", "mrcs2597cb@gmail.com");
        correoRequest.put("asunto", "ALERTA WONG: Nuevo Ticket #" + ticketGuardado.getId());
        correoRequest.put("mensaje", "Se ha registrado un nuevo ticket crítico: " + ticketGuardado.getTitulo() + " - " + ticketGuardado.getDescripcion());

        try {
            // El Core Service le habla al Notification Service por debajo de la mesa
            restTemplate.postForObject("http://localhost:8083/api/notifications/enviar", correoRequest, String.class);
            System.out.println("Aviso automático enviado exitosamente al notification-service");
        } catch (Exception e) {
            System.out.println("Error al contactar al notification-service: " + e.getMessage());
        }

        // 3. Devolvemos el ticket para que Postman/Frontend lo vea
        return ticketGuardado;
    }

    public List<Ticket> obtenerTodosLosTickets() {
        return ticketRepository.findAll();
    }

    public Ticket obtenerTicketPorId(Long id) {
        return ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket no encontrado"));
    }

    // Método para cambiar el estado de un ticket
    public Ticket actualizarEstado(Long id, String nuevoEstado, String username) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error: Ticket no encontrado con ID: " + id));

        String estadoAnterior = ticket.getEstado();
        ticket.setEstado(nuevoEstado);

        // --- NUEVO: REGISTRAR EL CAMBIO DE ESTADO ---
        com.wong.satsi.core_service.model.TicketTimeline evento = new com.wong.satsi.core_service.model.TicketTimeline();
        evento.setTipoEvento("status_change");
        evento.setTitulo("Estado Actualizado");
        evento.setDescripcion("El estado cambió de " + estadoAnterior + " a " + nuevoEstado);
        evento.setUsuario(username);
        evento.setTicket(ticket);

        ticket.getTimeline().add(evento);

        return ticketRepository.save(ticket);
    }

    public Ticket agregarComentario(Long id, String comentario, String username) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error: Ticket no encontrado con ID: " + id));

        com.wong.satsi.core_service.model.TicketTimeline evento = new com.wong.satsi.core_service.model.TicketTimeline();
        evento.setTipoEvento("comment");
        evento.setTitulo("Comentario agregado");
        evento.setDescripcion(comentario);
        evento.setUsuario(username);
        evento.setTicket(ticket);

        ticket.getTimeline().add(evento);

        return ticketRepository.save(ticket);
    }

    public Ticket subirEvidencia(Long id, MultipartFile archivo) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Error: Ticket no encontrado con ID: " + id));

        try {
            // 1. Crear una carpeta llamada "uploads" en tu proyecto si no existe
            String carpetaDestino = "uploads/";
            Path rutaDirectorio = Paths.get(carpetaDestino);
            if (!Files.exists(rutaDirectorio)) {
                Files.createDirectories(rutaDirectorio);
            }

            // 2. Generar un nombre único para evitar que fotos con el mismo nombre se chanquen
            String nombreOriginal = archivo.getOriginalFilename();
            String nombreUnico = UUID.randomUUID().toString() + "_" + nombreOriginal;
            Path rutaArchivo = rutaDirectorio.resolve(nombreUnico);

            // 3. Guardar el archivo físicamente en tu PC
            Files.copy(archivo.getInputStream(), rutaArchivo);

            // 4. Registrar los datos de la foto en la base de datos
            com.wong.satsi.core_service.model.Adjunto adjunto = new com.wong.satsi.core_service.model.Adjunto();
            adjunto.setNombreArchivo(nombreOriginal);
            adjunto.setTipoArchivo(archivo.getContentType());
            adjunto.setRutaArchivo(rutaArchivo.toString());
            adjunto.setTicket(ticket);

            ticket.getAdjuntos().add(adjunto);

            return ticketRepository.save(ticket);
        } catch (Exception e) {
            throw new RuntimeException("No se pudo guardar el archivo: " + e.getMessage());
        }
    }

}