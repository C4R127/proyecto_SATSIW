package com.wong.satsi.core_service.service;

import com.wong.satsi.core_service.model.Ticket;
import com.wong.satsi.core_service.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SlaMonitorService {

    // Usamos el Logger para imprimir mensajes en la consola
    private static final Logger log = LoggerFactory.getLogger(SlaMonitorService.class);
    private final TicketRepository ticketRepository;

    private final RestTemplate restTemplate;

    // La expresión cron "0 * * * * *" significa: Ejecutar en el segundo 0 de cada minuto.
    //@Scheduled(cron = "0 * * * * *")
    public void monitorearTiemposDeAtencion() {
        log.info("🔍 [CRON JOB] Iniciando revisión automática de SLA...");

        // 1. Obtenemos todos los tickets de la base de datos
        List<Ticket> tickets = ticketRepository.findAll();

        for (Ticket ticket : tickets) {
            // 2. Solo evaluamos tickets que aún necesitan atención
            if (!"RESUELTO".equalsIgnoreCase(ticket.getEstado()) && !"CERRADO".equalsIgnoreCase(ticket.getEstado())) {

                LocalDateTime creacion = ticket.getFechaCreacion();
                if (creacion == null) continue;

                // 3. Calculamos la fecha límite según la prioridad
                int horasSLA = obtenerHorasSla(ticket.getPrioridad());
                LocalDateTime fechaVencimiento = creacion.plusHours(horasSLA);
                LocalDateTime ahora = LocalDateTime.now();

                // 4. Calculamos cuántos minutos faltan o sobran
                long minutosRestantes = ChronoUnit.MINUTES.between(ahora, fechaVencimiento);

                // 5. Emitimos las alertas inteligentes
                // NUEVO: Verificamos que no se haya enviado la alerta previamente
                if (minutosRestantes < 0 && !Boolean.TRUE.equals(ticket.getAlertaVencimientoEnviada())) {
                    log.error("🚨 [SLA VENCIDO] El Ticket #{} superó su tiempo límite.", ticket.getId());

                    try {
                        String url = "http://localhost:8083/api/notifications/enviar";

                        java.util.Map<String, String> request = new java.util.HashMap<>();
                        request.put("destinatario", "mrcs2597cb@gmail.com");
                        request.put("asunto", "🚨 URGENTE: SLA Vencido - Ticket #" + ticket.getId());
                        request.put("mensaje", "El ticket '" + ticket.getTitulo() + "' ha superado su tiempo límite. Por favor, tomar acción inmediata.");

                        restTemplate.postForEntity(url, request, String.class);
                        log.info("📧 Alerta enviada al gerente exitosamente para el ticket {}", ticket.getId());

                        ticket.setAlertaVencimientoEnviada(true);
                        ticketRepository.save(ticket);


                    } catch (Exception e) {
                        log.error("Error al contactar al notification-service: {}", e.getMessage());
                    }
                    // Aquí es donde tu sistema llamará al iam-service para mandar correos al gerente
                } else if (minutosRestantes <= 60) {
                    log.warn("[SLA EN RIESGO] El Ticket #{} está a punto de vencer. Faltan {} minutos.",
                            ticket.getId(), minutosRestantes);
                }
            }
        }
    }

    //

    // Regla de Negocio: Tiempos de atención por criticidad
    private int obtenerHorasSla(String prioridad) {
        if (prioridad == null) return 24;
        switch (prioridad.toLowerCase()) {
            case "critical": return 2;
            case "high": return 8;
            case "medium": return 24;
            case "low": return 72;
            default: return 24;
        }
    }
}