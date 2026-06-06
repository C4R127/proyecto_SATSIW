import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Filter, Monitor, Wifi, CreditCard, Store, Clock } from 'lucide-react';
import { useTickets } from '../context/TicketContext';
import type { Ticket } from '../types';

export default function KanbanBoard() {
  const { tickets } = useTickets();
  const navigate = useNavigate();
  
  const priorities = {
    low: { bg: '#E8F5E9', text: '#2E7D32', label: 'Baja' },
    medium: { bg: '#FFF8E1', text: '#F57F17', label: 'Media' },
    high: { bg: '#FFF3E0', text: '#E65100', label: 'Alta' },
    critical: { bg: '#FFEBEE', text: '#C62828', label: 'Crítica' },
  };

  const slaStyles = {
    ok: { bg: '#E8F5E9', text: '#2E7D32' },
    warning: { bg: '#FFF3E0', text: '#E65100' },
    expired: { bg: '#FFEBEE', text: '#C62828' },
  };

  const categoryIcons: Record<string, typeof Monitor> = {
    'Hardware de Caja': Monitor,
    'Terminal POS': CreditCard,
    'Redes': Wifi,
    'Redes / Conectividad': Wifi,
    'Software / Sistema': Monitor,
    'Software': Monitor,
    'Hardware': Monitor,
  };

  const todoTickets = useMemo(
    () => tickets.filter((ticket) => {
      const status = String(ticket.status || '').toLowerCase().trim();
      return status === 'todo' || status === 'abierto';
    }),
    [tickets]
  );

  const inProgressTickets = useMemo(
    () => tickets.filter((ticket) => {
      const status = String(ticket.status || '').toLowerCase().trim();
      return status === 'in-progress' || status === 'en_progreso';
    }),
    [tickets]
  );

  const resolvedTickets = useMemo(
    () => tickets.filter((ticket) => {
      const status = String(ticket.status || '').toLowerCase().trim();
      return status === 'resolved' || status === 'resuelto';
    }),
    [tickets]
  );

  const TicketCard = ({ ticket, hover = false }: { ticket: Ticket; hover?: boolean }) => {
    const Icon = categoryIcons[ticket.category] || Monitor;
    
    // FILTRO DE LIMPIEZA: Extrae, convierte a minúsculas y quita espacios
    const rawPriority = (ticket as any).priority || (ticket as any).prioridad || 'low';
    const safePriority = String(rawPriority).toLowerCase().trim();
    
    // Busca el estilo limpio, y si por algún motivo no existe, usa "low" (Baja) por defecto
    const priorityStyle = priorities[safePriority as keyof typeof priorities] || priorities.low;
    
    // También aseguramos el SLA por si acaso
    const slaStyle = slaStyles[ticket.slaStatus as keyof typeof slaStyles] || slaStyles.ok;

    return (
      <div
        onClick={() => navigate(`/tickets/${ticket.id}`)}
        className={`bg-white rounded-lg p-4 mb-3 cursor-pointer transition-all ${
          hover
            ? 'shadow-lg border-l-4 border-[#D32F2F]'
            : 'shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:shadow-md'
        }`}
      >
        {/* Priority Badge */}
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-[18px] font-semibold text-[#212121] line-clamp-2 flex-1 pr-2">
            {ticket.title}
          </h3>
          <span
            className="px-3 py-1 rounded-[20px] text-[12px] font-medium whitespace-nowrap"
            style={{ backgroundColor: priorityStyle.bg, color: priorityStyle.text }}
          >
            {priorityStyle.label}
          </span>
        </div>

        {/* Category & Store */}
        <div className="space-y-2 mb-3">
          <div className="flex items-center gap-2 text-[12px] text-[#757575]">
            <Icon className="w-4 h-4" />
            <span>{ticket.category}</span>
          </div>
          <div className="flex items-center gap-2 text-[12px] text-[#757575]">
            <Store className="w-4 h-4" />
            <span>{ticket.store}</span>
          </div>
        </div>

        <div className="h-px bg-[#E0E0E0] my-3" />

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#D32F2F] flex items-center justify-center text-white text-[10px] font-medium">
              {ticket.createdBy ? ticket.createdBy.charAt(0).toUpperCase() : 'U'}
            </div>
            <span className="text-[12px] text-[#757575]">{ticket.createdBy}</span>
          </div>

          <div
            className="flex items-center gap-1 px-2 py-1 rounded-[20px] text-[12px] font-medium"
            style={{ backgroundColor: slaStyle.bg, color: slaStyle.text }}
          >
            <Clock className="w-3 h-3" />
            <span>
              {ticket.slaStatus === 'expired' ? 'Vencido' : `${ticket.slaHours || 24}h restantes`}
            </span>
          </div>
        </div>
      </div>
    );
  };

  const Column = ({ title, count, color, tickets, highlightCard }: any) => (
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-[18px] font-semibold text-[#212121]">{title}</h3>
        <span
          className="px-3 py-1 rounded-[20px] text-[12px] font-medium"
          style={{ backgroundColor: color, color: '#FFFFFF' }}
        >
          {count}
        </span>
      </div>

      <div className="space-y-3">
        {tickets.length > 0 ? (
          tickets.map((ticket: Ticket, index: number) => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              hover={highlightCard === index}
            />
          ))
        ) : (
          <div className="bg-white rounded-lg p-8 text-center">
            <div className="text-[#BDBDBD] mb-2">
              <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-[14px] text-[#757575]">No hay tickets aquí</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-[24px] font-semibold text-[#212121]">Mi Tablero</h2>
          <span className="text-[14px] text-[#757575]">
            {todoTickets.length + inProgressTickets.length + resolvedTickets.length} tickets activos
          </span>
        </div>

        <button className="flex items-center gap-2 px-4 py-2 border border-[#D32F2F] text-[#D32F2F] rounded-md text-[14px] font-medium hover:bg-[#FFEBEE] transition-all">
          <Filter className="w-4 h-4" />
          Filtrar
        </button>
      </div>

      {/* Kanban Columns */}
      <div className="grid grid-cols-3 gap-6">
        <Column
          title="Por Hacer"
          count={todoTickets.length}
          color="#1565C0"
          tickets={todoTickets}
        />
        <Column
          title="En Progreso"
          count={inProgressTickets.length}
          color="#F57F17"
          tickets={inProgressTickets}
          highlightCard={0}
        />
        <Column
          title="Resuelto"
          count={resolvedTickets.length}
          color="#2E7D32"
          tickets={resolvedTickets}
        />
      </div>
    </div>
  );
}