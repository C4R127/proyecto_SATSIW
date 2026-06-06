import type { Ticket, TicketPriority, TicketStatus, TicketTimelineEvent } from '../app/types';

const nowDate = '01 Abr 2026, 09:15';

const buildTimeline = (items: TicketTimelineEvent[]) => items;

const tickets: Ticket[] = [
  {
    id: 'TK-2041',
    title: 'Caja Nro 5 no enciende despues del corte de luz',
    description: 'La caja principal no enciende luego del corte. Se necesita revision urgente.',
    status: 'todo',
    priority: 'critical',
    category: 'Hardware de Caja',
    createdBy: 'Maria Lopez',
    assignedTo: 'Carlos Moron',
    createdDate: nowDate,
    dueDate: '01 Abr 2026, 11:15',
    store: 'Wong Plaza Norte',
    slaHours: 2,
    slaStatus: 'warning',
    timeline: buildTimeline([
      {
        id: 'ev-2041-1',
        type: 'created',
        title: 'Ticket creado por Maria Lopez',
        date: '01 Abr, 09:15',
      },
    ]),
  },
  {
    id: 'TK-2038',
    title: 'Sistema de inventario no actualiza stock en tiempo real',
    description:
      'El sistema de inventario presenta demoras de mas de 30 minutos para actualizar el stock despues de una venta.',
    status: 'in-progress',
    priority: 'high',
    category: 'Software / Sistema',
    createdBy: 'Carlos Ruiz',
    assignedTo: 'Carlos Moron',
    createdDate: '01 Abr 2026, 09:15',
    dueDate: '01 Abr 2026, 18:00',
    store: 'Wong San Miguel',
    slaHours: 3,
    slaStatus: 'warning',
    timeline: buildTimeline([
      {
        id: 'ev-2038-1',
        type: 'created',
        title: 'Ticket creado por Carlos Ruiz',
        date: '01 Abr, 09:15',
      },
      {
        id: 'ev-2038-2',
        type: 'assigned',
        title: 'Asignado a Carlos Moron',
        date: '01 Abr, 09:20',
      },
      {
        id: 'ev-2038-3',
        type: 'comment',
        title: 'Comentario agregado',
        description:
          'He verificado los logs del sistema. Parece ser un problema con la sincronizacion de la base de datos.',
        date: '01 Abr, 11:30',
      },
      {
        id: 'ev-2038-4',
        type: 'status-change',
        title: 'Estado: Abierto -> En Progreso',
        date: '01 Abr, 11:31',
      },
    ]),
  },
  {
    id: 'TK-2037',
    title: 'Impresora de tickets atascada',
    description: 'La impresora se atasco y no imprime tickets.',
    status: 'in-progress',
    priority: 'medium',
    category: 'Hardware',
    createdBy: 'Sofia Mendoza',
    assignedTo: 'Luis Torres',
    createdDate: '01 Abr 2026, 08:30',
    dueDate: '01 Abr 2026, 14:30',
    store: 'Wong La Molina',
    slaHours: 6,
    slaStatus: 'ok',
    timeline: buildTimeline([
      {
        id: 'ev-2037-1',
        type: 'created',
        title: 'Ticket creado por Sofia Mendoza',
        date: '01 Abr, 08:30',
      },
      {
        id: 'ev-2037-2',
        type: 'assigned',
        title: 'Asignado a Luis Torres',
        date: '01 Abr, 08:35',
      },
    ]),
  },
  {
    id: 'TK-2036',
    title: 'Reinicio de router soluciono problema de red',
    description: 'Incidencia de red resuelta con reinicio del router.',
    status: 'resolved',
    priority: 'low',
    category: 'Redes',
    createdBy: 'Luis Torres',
    assignedTo: 'Luis Torres',
    createdDate: '31 Mar 2026, 18:10',
    dueDate: '01 Abr 2026, 06:00',
    store: 'Wong Ovalo Gutierrez',
    slaHours: 12,
    slaStatus: 'ok',
    timeline: buildTimeline([
      {
        id: 'ev-2036-1',
        type: 'created',
        title: 'Ticket creado por Luis Torres',
        date: '31 Mar, 18:10',
      },
      {
        id: 'ev-2036-2',
        type: 'status-change',
        title: 'Estado: En Progreso -> Resuelto',
        date: '01 Abr, 06:00',
      },
    ]),
  },
];

export function listTickets() {
  return tickets;
}

export function getTicket(id: string) {
  return tickets.find((ticket) => ticket.id === id) || null;
}

export function addTicket(payload: {
  title: string;
  description: string;
  category: string;
  priority: TicketPriority;
}) {
  const nextId = `TK-${Math.floor(2000 + Math.random() * 900)}`;
  const createdDate = '01 Abr 2026, 12:00';

  const newTicket: Ticket = {
    id: nextId,
    title: payload.title,
    description: payload.description,
    status: 'todo',
    priority: payload.priority,
    category: payload.category,
    createdBy: 'Maria Lopez',
    assignedTo: 'Sin asignar',
    createdDate,
    dueDate: '01 Abr 2026, 18:00',
    store: 'Wong Plaza Norte',
    slaHours: 8,
    slaStatus: 'ok',
    timeline: [
      {
        id: `ev-${nextId}-1`,
        type: 'created',
        title: 'Ticket creado por Maria Lopez',
        date: '01 Abr, 12:00',
      },
    ],
  };

  tickets.unshift(newTicket);
  return newTicket;
}

export function patchTicketStatus(id: string, status: TicketStatus) {
  const ticket = getTicket(id);
  if (!ticket) {
    return null;
  }

  ticket.status = status;
  ticket.timeline.unshift({
    id: `ev-${id}-${Date.now()}`,
    type: 'status-change',
    title: `Estado actualizado: ${status}`,
    date: '01 Abr, 12:05',
  });

  return ticket;
}

export function addComment(id: string, message: string) {
  const ticket = getTicket(id);
  if (!ticket) {
    return null;
  }

  ticket.timeline.unshift({
    id: `ev-${id}-comment-${Date.now()}`,
    type: 'comment',
    title: 'Comentario agregado',
    description: message,
    date: '01 Abr, 12:10',
  });

  return ticket;
}
