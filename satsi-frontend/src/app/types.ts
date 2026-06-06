export type UserRole = 'store' | 'technician' | 'manager' | 'sysadmin';

export type TicketPriority = 'low' | 'medium' | 'high' | 'critical';
export type TicketStatus = 'todo' | 'in-progress' | 'resolved' | 'closed';
export type SlaStatus = 'ok' | 'warning' | 'expired';

export interface TicketTimelineEvent {
  id: string;
  type: 'created' | 'assigned' | 'comment' | 'status-change';
  title: string;
  description?: string;
  date: string;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: string;
  createdBy: string;
  assignedTo?: string;
  createdDate: string;
  dueDate: string;
  store: string;
  slaHours: number;
  slaStatus: SlaStatus;
  timeline: TicketTimelineEvent[];
  attachments?: { id: string; name: string; url: string }[];
}

export interface AuthUser {
  id: string;
  name: string;
  role: UserRole;
}

export interface TicketInput {
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  store?: string;
}
