import { http, HttpResponse } from 'msw';
import { addComment, addTicket, getTicket, listTickets, patchTicketStatus } from './data';

export const handlers = [
  http.post('/api/auth/login', async ({ request }) => {
    const body = (await request.json()) as { email: string; roleHint?: string };

    let role = body.roleHint || 'store';
    if (body.email.includes('admin') || body.email.includes('hans')) {
      role = 'admin';
    }

    if (body.email.includes('tech')) {
      role = 'technician';
    }

    return HttpResponse.json({
      id: 'user-1',
      name: role === 'admin' ? 'Hans Rodriguez' : role === 'technician' ? 'Carlos Moron' : 'Maria Lopez',
      role,
    });
  }),

  http.get('/api/tickets', () => {
    return HttpResponse.json(listTickets());
  }),

  http.get('/api/tickets/:id', ({ params }) => {
    const ticket = getTicket(String(params.id));
    if (!ticket) {
      return HttpResponse.json({ message: 'Ticket no encontrado' }, { status: 404 });
    }
    return HttpResponse.json(ticket);
  }),

  http.post('/api/tickets', async ({ request }) => {
    const payload = (await request.json()) as {
      title: string;
      description: string;
      category: string;
      priority: 'low' | 'medium' | 'high' | 'critical';
    };
    const ticket = addTicket(payload);
    return HttpResponse.json(ticket, { status: 201 });
  }),

  http.patch('/api/tickets/:id/status', async ({ params, request }) => {
    const body = (await request.json()) as { status: 'todo' | 'in-progress' | 'resolved' | 'closed' };
    const ticket = patchTicketStatus(String(params.id), body.status);
    if (!ticket) {
      return HttpResponse.json({ message: 'Ticket no encontrado' }, { status: 404 });
    }
    return HttpResponse.json(ticket);
  }),

  http.post('/api/tickets/:id/comments', async ({ params, request }) => {
    const body = (await request.json()) as { message: string };
    const ticket = addComment(String(params.id), body.message);
    if (!ticket) {
      return HttpResponse.json({ message: 'Ticket no encontrado' }, { status: 404 });
    }
    return HttpResponse.json(ticket);
  }),
];
