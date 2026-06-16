import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { Ticket, TicketInput, TicketStatus } from '../types';
import {
  addTicketComment,
  createTicket,
  getTicketById,
  getTickets,
  updateTicketStatus,
} from '../api/tickets';

interface TicketContextValue {
  tickets: Ticket[];
  isLoading: boolean;
  refresh: () => Promise<void>;
  create: (payload: TicketInput) => Promise<Ticket>;
  updateStatus: (id: string, status: TicketStatus) => Promise<Ticket>;
  addComment: (id: string, message: string) => Promise<Ticket>;
  findById: (id: string) => Promise<Ticket | null>;
}

const TicketContext = createContext<TicketContextValue | undefined>(undefined);

export function TicketProvider({ children }: { children: ReactNode }) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = async () => {
    setIsLoading(true);
    try {
      const data = await getTickets();
      setTickets(data);
    } catch (error) {
      console.error("Error al cargar tickets (esto es normal si el backend aún no autoriza):", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const create = async (payload: TicketInput) => {
    const ticket = await createTicket(payload);
    setTickets((prev) => [ticket, ...prev]);
    return ticket;
  };

  const updateStatus = async (id: string, status: TicketStatus) => {
    const ticket = await updateTicketStatus(id, status);
    setTickets((prev) => prev.map((item) => (item.id === id ? ticket : item)));
    return ticket;
  };

  const addComment = async (id: string, message: string) => {
    const ticket = await addTicketComment(id, message);
    setTickets((prev) => prev.map((item) => (item.id === id ? ticket : item)));
    return ticket;
  };

  const findById = async (id: string) => {
    const local = tickets.find((ticket) => ticket.id === id);
    if (local) {
      return local;
    }
    const remote = await getTicketById(id);
    if (remote) {
      setTickets((prev) => [remote, ...prev]);
    }
    return remote || null;
  };

  const value = useMemo(
    () => ({
      tickets,
      isLoading,
      refresh,
      create,
      updateStatus,
      addComment,
      findById,
    }),
    [tickets, isLoading]
  );

  return <TicketContext.Provider value={value}>{children}</TicketContext.Provider>;
}


export function useTickets() {
  const context = useContext(TicketContext);
  if (!context) {
    throw new Error('useTickets debe usarse dentro de TicketProvider');
  }
  return context;
}
