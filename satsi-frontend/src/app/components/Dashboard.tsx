import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Ticket, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { useTickets } from '../context/TicketContext';
import type { Ticket as TicketType } from '../types';

export default function Dashboard() {
  const { tickets, isLoading } = useTickets();
  const navigate = useNavigate();

  type Stat = { icon: typeof Ticket; label: string; value: string; color: string };

  const stats = useMemo<Stat[]>(() => {
    const inProgress = tickets.filter((ticket: TicketType) => ticket.status === 'in-progress').length;
    const resolved = tickets.filter((ticket: TicketType) => ticket.status === 'resolved').length;
    const critical = tickets.filter((ticket: TicketType) => ticket.priority === 'critical').length;

    return [
      { icon: Ticket, label: 'Tickets Asignados', value: String(tickets.length), color: '#1565C0' },
      { icon: Clock, label: 'En Progreso', value: String(inProgress), color: '#F57F17' },
      { icon: CheckCircle, label: 'Resueltos Hoy', value: String(resolved), color: '#2E7D32' },
      { icon: AlertTriangle, label: 'Criticos', value: String(critical), color: '#D32F2F' },
    ];
  }, [tickets]);

  const recentTickets = useMemo<TicketType[]>(() => tickets.slice(0, 3), [tickets]);

  return (
    <div className="p-8">
      <div className="mb-6">
        <h2 className="text-[24px] font-semibold text-[#212121] mb-1">Dashboard</h2>
        <p className="text-[14px] text-[#757575]">Resumen de tus tickets activos</p>
      </div>

      {isLoading && (
        <div className="text-[14px] text-[#757575]">Cargando tickets...</div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-4 gap-6 mb-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${stat.color}15` }}>
                  <Icon className="w-6 h-6" style={{ color: stat.color }} />
                </div>
                <div>
                  <p className="text-[14px] text-[#757575]">{stat.label}</p>
                  <p className="text-[28px] font-bold text-[#212121]">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Tickets */}
      <div className="bg-white rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-6">
        <h3 className="text-[18px] font-semibold text-[#212121] mb-4">Tickets Recientes</h3>
        <div className="space-y-3">
          {recentTickets.map((ticket) => {
            const priorityColors: Record<string, { bg: string; text: string }> = {
              critical: { bg: '#FFEBEE', text: '#C62828' },
              high: { bg: '#FFF3E0', text: '#E65100' },
              medium: { bg: '#FFF8E1', text: '#F57F17' },
              low: { bg: '#E8F5E9', text: '#2E7D32' },
            };
            const style = priorityColors[ticket.priority] || priorityColors.medium;
            const priorityLabel =
              ticket.priority === 'critical'
                ? 'Critica'
                : ticket.priority === 'high'
                  ? 'Alta'
                  : ticket.priority === 'medium'
                    ? 'Media'
                    : 'Baja';

            return (
              <div
                key={ticket.id}
                onClick={() => navigate(`/tickets/${ticket.id}`)}
                className="flex items-center justify-between p-4 border border-[#E0E0E0] rounded-md hover:border-[#D32F2F] cursor-pointer transition-all"
              >
                <div>
                  <p className="text-[14px] font-medium text-[#212121] mb-1">{ticket.title}</p>
                  <p className="text-[12px] text-[#757575]">{ticket.store}</p>
                </div>
                <span
                  className="px-3 py-1 rounded-[20px] text-[12px] font-medium"
                  style={{ backgroundColor: style.bg, color: style.text }}
                >
                  {priorityLabel}
                </span>
              </div>
            );
          })}
        </div>
        <button
          onClick={() => navigate('/kanban')}
          className="w-full mt-4 py-2 text-[14px] text-[#D32F2F] font-medium hover:bg-[#FFEBEE] rounded-md transition-all"
        >
          Ver todos los tickets
        </button>
      </div>
    </div>
  );
}
