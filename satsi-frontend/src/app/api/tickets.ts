import { apiFetch } from './client';
import type { Ticket, TicketInput, TicketStatus } from '../types';

// --- Funciones auxiliares para la "traducción" ---
function mapStatus(estadoJava: string): 'todo' | 'in-progress' | 'resolved' | 'closed' {
    if (!estadoJava) return 'todo';
    switch (estadoJava.toUpperCase()) {
        case 'EN_PROGRESO': return 'in-progress';
        case 'RESUELTO': return 'resolved';
        case 'CERRADO': return 'closed';
        case 'ABIERTO':
        default: return 'todo';
    }
}

function mapPriority(prioridadJava: string): 'low' | 'medium' | 'high' | 'critical' {
  if (!prioridadJava) return 'low';
  
  // Convertimos a minúsculas y quitamos espacios por seguridad
  const segura = prioridadJava.toLowerCase().trim();
  
  switch (segura) {
    case 'media':
    case 'medium': 
      return 'medium';
      
    case 'alta':
    case 'high': 
      return 'high';
      
    case 'critica':
    case 'crítica':
    case 'critical': 
      return 'critical';
      
    case 'baja':
    case 'low':
    default: 
      return 'low';
  }
}

// Calcula cuántas horas le corresponden según prioridad
function calcularHorasSla(prioridad: string): number {
  switch (prioridad?.toLowerCase()) {
    case 'critical': return 2;
    case 'high': return 8;
    case 'medium': return 24;
    case 'low': return 72;
    default: return 24;
  }
}

// Determina el color del semáforo (ok = Verde, warning = Amarillo, breached = Rojo)
// Fíjate que aquí cambiamos 'breached' por 'error' en el tipo de retorno
function calcularEstadoSla(fechaCreacion: string, prioridad: string, estadoTicket: string): 'ok' | 'warning' | 'expired' {
  if (!fechaCreacion) return 'ok';
  
  if (estadoTicket === 'RESUELTO' || estadoTicket === 'CERRADO') return 'ok';

  const creacion = new Date(fechaCreacion);
  const horasSla = calcularHorasSla(prioridad);
  
  const limite = new Date(creacion.getTime() + horasSla * 60 * 60 * 1000);
  const ahora = new Date();
  
  const faltanMilisegundos = limite.getTime() - ahora.getTime();
  const faltanMinutos = faltanMilisegundos / (1000 * 60);

  // Y aquí también devolvemos 'error' en lugar de 'breached'
  if (faltanMinutos < 0) return 'expired'; // SLA Vencido
  if (faltanMinutos <= 60) return 'warning'; // Falta 1 hora o menos
  return 'ok'; // Aún hay tiempo
}

// NUEVO: Función maestra que convierte cualquier ticket de Java a React
function mapJavaToReactTicket(ticket: any): Ticket {
  return {
    id: ticket.id?.toString(),
    title: ticket.titulo,
    description: ticket.descripcion,
    category: ticket.categoria,
    priority: mapPriority(ticket.prioridad),
    status: mapStatus(ticket.estado),
    store: ticket.tienda || 'Wong Plaza Norte - Lima',
    createdBy: ticket.usuarioUsername,
    createdDate: ticket.fechaCreacion,
    dueDate: ticket.fechaCreacion, 
    slaStatus: calcularEstadoSla(ticket.fechaCreacion, ticket.prioridad, ticket.estado), 
    slaHours: calcularHorasSla(ticket.prioridad),

    // Tu código actual del timeline (Intacto)
    timeline: ticket.timeline ? ticket.timeline.map((t: any) => ({
      id: t.id?.toString(),
      type: t.tipoEvento,
      title: t.titulo,
      description: t.descripcion,
      date: new Date(t.fecha).toLocaleString('es-PE'),
      user: t.usuario
    })) : [],

    // --- NUEVA INTEGRACIÓN: Mapeo de las imágenes ---
    attachments: ticket.adjuntos && Array.isArray(ticket.adjuntos) ? ticket.adjuntos.map((a: any) => {
      // Extraemos solo el nombre del archivo de la ruta larga
      const nombreUnico = a.rutaArchivo.replace(/^.*[\\\/]/, '');
      return {
          id: a.id?.toString(),
          name: a.nombreArchivo,
          url: `http://localhost:8080/api/tickets/evidencia/${nombreUnico}`
      };
    }) : [],
  };
}

// --- Funciones API ---

export async function getTickets(): Promise<Ticket[]> {
  const data = await apiFetch<any[]>('/api/tickets');
  // Usamos la función maestra para cada ticket de la lista
  return data.map(mapJavaToReactTicket);
}

export async function getTicketById(id: string): Promise<Ticket> {
  const data = await apiFetch<any>(`/api/tickets/${id}`);
  return mapJavaToReactTicket(data);
}

export async function createTicket(payload: any): Promise<Ticket> {
  // Traducimos el payload de React al DTO exacto que espera Java
  const backendPayload = {
    titulo: payload.title,
    descripcion: payload.description,
    equipoId: payload.equipoId,       // NUEVO: Enviamos el ID numérico del equipo
    prioridad: payload.priority,
    sucursalId: payload.sucursalId    // NUEVO: Enviamos el ID numérico de la sucursal
  };

  const data = await apiFetch<any>('/api/tickets', {
    method: 'POST',
    body: JSON.stringify(backendPayload),
  });

  return mapJavaToReactTicket(data);
}

export async function updateTicketStatus(id: string, status: TicketStatus): Promise<Ticket> {
  let estadoJava = 'ABIERTO';
  switch (status) {
    case 'in-progress': estadoJava = 'EN_PROGRESO'; break;
    case 'resolved': estadoJava = 'RESUELTO'; break;
    case 'closed': estadoJava = 'CERRADO'; break;
    case 'todo':
    default: estadoJava = 'ABIERTO'; break;
  }

  const data = await apiFetch<any>(`/api/tickets/${id}/estado?estado=${estadoJava}`, {
    method: 'PUT',
  });
  return mapJavaToReactTicket(data); // Pasamos la respuesta por el traductor
}

export async function addTicketComment(id: string, message: string): Promise<Ticket> {
  const data = await apiFetch<any>(`/api/tickets/${id}/comments`, {
    method: 'POST',
    body: JSON.stringify({ message }),
  });
  return mapJavaToReactTicket(data);
}

// Añadir al final de tickets.ts
export async function uploadTicketAttachment(id: string, file: File): Promise<Ticket> {
  const token = localStorage.getItem('jwt_token');
  const formData = new FormData();
  formData.append('archivo', file);

  const response = await fetch(`http://localhost:8080/api/tickets/${id}/adjuntos`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
      // IMPORTANTE: Cuando usamos FormData, NO enviamos el 'Content-Type'. 
      // El navegador lo calcula automáticamente para poder enviar archivos.
    },
    body: formData
  });

  if (!response.ok) {
    throw new Error('Error al subir la evidencia multimedia');
  }
  
  const data = await response.json();
  return mapJavaToReactTicket(data); // Reutilizamos tu excelente traductor
}