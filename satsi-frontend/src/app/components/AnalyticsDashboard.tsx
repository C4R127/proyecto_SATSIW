import { useMemo } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { Ticket, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';
import { useTickets } from '../context/TicketContext';
import { useAuth } from '../context/AuthContext';
import type { Ticket as TicketType } from '../types';

export default function AnalyticsDashboard() {
  const { tickets } = useTickets();
  const { user } = useAuth();

  type CategoryDatum = { name: string; value: number };
  type StatusDatum = { name: string; value: number; color: string };

  // AnalyticsDashboard.tsx (Reemplazo para el grouping logic)

 const categoryData = useMemo<CategoryDatum[]>(() => {
    const counts = tickets.reduce<Record<string, number>>((acc, ticket: TicketType) => {
      // 1. Rescatamos la categoría enviada desde Java (probamos ambos nombres por seguridad)
      const rawCategory = ticket.category || (ticket as any).categoria;

      // 2. Por defecto, si un ticket viejo no tiene categoría, irá a "Otras"
      let friendlyName = 'Otras';

      // 3. Traducimos la clave de la base de datos al nombre bonito para tu gráfico
      if (rawCategory) {
        const cleanCat = String(rawCategory).toUpperCase().trim();
        switch (cleanCat) {
          case 'HARDWARE_CAJA': friendlyName = 'Hardware de Caja'; break;
          case 'REDES_CONECTIVIDAD': friendlyName = 'Redes'; break;
          case 'COMPUTO_ESTACIONES': friendlyName = 'POS'; break;
          case 'SOFTWARE_SISTEMAS': friendlyName = 'Software'; break;
          case 'OTRAS': friendlyName = 'Otras'; break;
          default: friendlyName = 'Otras'; break;
        }
      }

      // Agrupamos contando +1 en la categoría correspondiente
      acc[friendlyName] = (acc[friendlyName] || 0) + 1;
      return acc;
    }, {});

    // Convertimos el objeto en el arreglo que Recharts necesita para dibujar las barras
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [tickets]);

  const statusData = useMemo<StatusDatum[]>(() => {
    const total = tickets.length || 1;
    const countByStatus = tickets.reduce<Record<string, number>>((acc, ticket: TicketType) => {
      acc[ticket.status] = (acc[ticket.status] || 0) + 1;
      return acc;
    }, {});

    return [
      { name: 'Abiertos', value: Math.round(((countByStatus['todo'] || 0) / total) * 100), color: '#1565C0' },
      { name: 'En Progreso', value: Math.round(((countByStatus['in-progress'] || 0) / total) * 100), color: '#F57F17' },
      { name: 'Resueltos', value: Math.round(((countByStatus['resolved'] || 0) / total) * 100), color: '#2E7D32' },
      { name: 'Cerrados', value: Math.round(((countByStatus['closed'] || 0) / total) * 100), color: '#616161' },
    ];
  }, [tickets]);

  const criticalTickets = useMemo(
    () =>
      tickets
        .filter((ticket: TicketType) => ticket.priority === 'critical' || ticket.priority === 'high')
        .slice(0, 5)
        .map((ticket: TicketType) => ({
          id: ticket.id,
          title: ticket.title,
          store: ticket.store,
          technician: ticket.assignedTo || 'Sin asignar',
          sla: ticket.slaStatus === 'expired' ? 'Vencido' : `${ticket.slaHours}h`,
          status: ticket.priority === 'critical' ? 'Critico' : 'Alta',
        })),
    [tickets]
  );

  const totalTickets = tickets.length;
  const criticalActive = tickets.filter((ticket: TicketType) => ticket.priority === 'critical').length;
  const resolvedTickets = tickets.filter((ticket: TicketType) => ticket.status === 'resolved').length;
  const slaCompliance = totalTickets ? Math.round((resolvedTickets / totalTickets) * 100) : 0;

  const KPICard = ({ icon: Icon, title, value, trend, color }: any) => (
    <div className="bg-white rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-6">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center`} style={{ backgroundColor: `${color}15` }}>
          <Icon className="w-6 h-6" style={{ color }} />
        </div>
        {trend && (
          <div className="flex items-center gap-1 text-[12px] font-medium text-[#D32F2F]">
            <TrendingUp className="w-4 h-4" />
            <span>{trend}</span>
          </div>
        )}
      </div>
      <h3 className="text-[14px] text-[#757575] mb-1">{title}</h3>
      <p className="text-[32px] font-bold text-[#212121]">{value}</p>
    </div>
  );

  return (
    <div className="p-8">
      {/* Greeting */}
      <div className="mb-6">
        <h2 className="text-[24px] font-semibold text-[#212121] mb-1">
          Buenos dias, {user?.name || 'Hans'}
        </h2>
        <p className="text-[14px] text-[#757575]">
          Resumen operativo de hoy — {new Date().toLocaleDateString('es-PE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-6 mb-6">
        <KPICard
          icon={Ticket}
          title="Tickets Abiertos Hoy"
          value={String(totalTickets)}
          color="#1565C0"
        />
        <KPICard
          icon={AlertTriangle}
          title="Tickets Críticos Activos"
          value={String(criticalActive)}
          trend={criticalActive > 0 ? '↑ 15%' : undefined}
          color="#D32F2F"
        />
        <div className="bg-white rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-[#2E7D321A] flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-[#2E7D32]" />
            </div>
          </div>
          <h3 className="text-[14px] text-[#757575] mb-1">% Cumplimiento SLA</h3>
          <div className="flex items-end gap-2">
            <p className="text-[32px] font-bold text-[#212121]">{slaCompliance}%</p>
          </div>
          <div className="mt-3 w-full h-2 bg-[#E0E0E0] rounded-full overflow-hidden">
              <div className="h-full bg-[#2E7D32] rounded-full" style={{ width: `${slaCompliance}%` }} />
          </div>
        </div>
        <KPICard
          icon={CheckCircle}
          title="Resueltos Esta Semana"
            value={String(resolvedTickets)}
          color="#2E7D32"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Bar Chart */}
        <div className="bg-white rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-6">
          <h3 className="text-[18px] font-semibold text-[#212121] mb-6">
            Incidencias por Categoría
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryData}>
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12, fill: '#757575' }}
                tickLine={false}
                axisLine={{ stroke: '#E0E0E0' }}
              />
              <YAxis
                tick={{ fontSize: 12, fill: '#757575' }}
                tickLine={false}
                axisLine={{ stroke: '#E0E0E0' }}
              />
              <Bar dataKey="value" fill="#D32F2F" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="bg-white rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-6">
          <h3 className="text-[18px] font-semibold text-[#212121] mb-6">
            Estado General de Tickets
          </h3>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width="60%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            {/* Legend */}
            <div className="flex-1 space-y-3">
              {statusData.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-[14px] text-[#757575]">{item.name}</span>
                  </div>
                  <span className="text-[14px] font-medium text-[#212121]">
                    {item.value}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Critical Tickets Table */}
      <div className="bg-white rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-6">
        <h3 className="text-[18px] font-semibold text-[#212121] mb-6">
          Tickets Críticos Recientes
        </h3>

        <table className="w-full">
          <thead>
            <tr className="border-b border-[#E0E0E0]">
              <th className="text-left py-3 px-4 text-[12px] font-medium text-[#757575]">ID</th>
              <th className="text-left py-3 px-4 text-[12px] font-medium text-[#757575]">Título</th>
              <th className="text-left py-3 px-4 text-[12px] font-medium text-[#757575]">Tienda</th>
              <th className="text-left py-3 px-4 text-[12px] font-medium text-[#757575]">Técnico Asignado</th>
              <th className="text-left py-3 px-4 text-[12px] font-medium text-[#757575]">SLA</th>
              <th className="text-left py-3 px-4 text-[12px] font-medium text-[#757575]">Estado</th>
            </tr>
          </thead>
          <tbody>
            {criticalTickets.map((ticket, index) => {
              const statusColors: Record<string, { bg: string; text: string }> = {
                'Critico': { bg: '#FFEBEE', text: '#C62828' },
                'Alta': { bg: '#FFF3E0', text: '#E65100' },
                'Media': { bg: '#FFF8E1', text: '#F57F17' },
              };

              const style = statusColors[ticket.status] || { bg: '#FFF8E1', text: '#F57F17' };

              return (
                <tr
                  key={ticket.id}
                  className={index % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFA]'}
                >
                  <td className="py-3 px-4 text-[14px] text-[#D32F2F] font-medium">
                    {ticket.id}
                  </td>
                  <td className="py-3 px-4 text-[14px] text-[#212121]">
                    {ticket.title}
                  </td>
                  <td className="py-3 px-4 text-[14px] text-[#757575]">
                    {ticket.store}
                  </td>
                  <td className="py-3 px-4 text-[14px] text-[#757575]">
                    {ticket.technician}
                  </td>
                  <td className="py-3 px-4 text-[14px] text-[#757575]">
                    {ticket.sla}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className="px-3 py-1 rounded-[20px] text-[12px] font-medium"
                      style={{ backgroundColor: style.bg, color: style.text }}
                    >
                      {ticket.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
