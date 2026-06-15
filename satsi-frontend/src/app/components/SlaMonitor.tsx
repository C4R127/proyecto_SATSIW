import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, AlertTriangle, AlertCircle } from 'lucide-react';
import { apiFetch } from '../api/client';

export default function SlaMonitor() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Descargamos los tickets reales de tu Java
  const fetchTickets = async () => {
    try {
      const data = await apiFetch<any[]>('/api/tickets');
      setTickets(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error cargando tickets para SLA:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Se actualiza al entrar y recarga silenciosamente cada 60 segundos
  useEffect(() => {
    fetchTickets();
    const interval = setInterval(fetchTickets, 60000); 
    return () => clearInterval(interval);
  }, []);

  // 2. Lógica matemática de SLA (Tiempos máximos de atención)
  const getSlaHours = (prioridad: string) => {
    const p = String(prioridad || '').toLowerCase();
    if (p.includes('critica') || p.includes('critical')) return 2;
    if (p.includes('alta') || p.includes('high')) return 8;
    if (p.includes('media') || p.includes('medium')) return 24;
    return 72; // Baja
  };

  const formatTimeLeft = (hours: number) => {
    if (hours < 0) return `Vencido hace ${Math.abs(Math.round(hours))}h`;
    if (hours < 1) return `${Math.round(hours * 60)} min restantes`;
    return `${Math.round(hours)}h restantes`;
  };

  // 3. Procesamos los datos para las métricas
  const activeTickets = tickets.filter(t => {
    const s = String(t.estado || '').toLowerCase();
    return s !== 'cerrado' && s !== 'resuelto';
  });

  let cumplido = 0;
  let porVencer = 0;
  let incumplido = 0;

  const ticketsProcesados = activeTickets.map(ticket => {
    // Calculamos el tiempo desde que se creó en la base de datos
    const fechaCreacion = new Date(ticket.fechaCreacion || new Date());
    const horasSla = getSlaHours(ticket.prioridad);
    const vencimiento = new Date(fechaCreacion.getTime() + horasSla * 60 * 60 * 1000);
    const ahora = new Date();
    
    // Diferencia en horas
    const horasRestantes = (vencimiento.getTime() - ahora.getTime()) / (1000 * 60 * 60);

    let estadoSla = 'ok';
    if (horasRestantes < 0) {
      estadoSla = 'breached';
      incumplido++;
    } else if (horasRestantes <= 2) {
      estadoSla = 'warning';
      porVencer++;
    } else {
      cumplido++;
    }

    return { ...ticket, horasRestantes, estadoSla };
  }).sort((a, b) => a.horasRestantes - b.horasRestantes); // Ordenamos: Urgentes primero

  // Porcentaje de Salud del Sistema
  const porcentaje = activeTickets.length === 0 ? 100 : Math.round(((cumplido + porVencer) / activeTickets.length) * 100);

  if (isLoading) {
    return <div className="p-8 text-center text-[#757575]">Calculando métricas de rendimiento...</div>;
  }

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-[24px] font-bold text-[#212121] mb-2">Monitoreo de SLA</h1>
        <p className="text-[14px] text-[#757575]">Seguimiento en tiempo real de tiempos de resolución de incidencias</p>
      </div>

      {/* Tarjetas de Indicadores (KPIs) */}
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.08)] border-l-4 border-[#2E7D32] flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#E8F5E9] flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-[#2E7D32]" />
          </div>
          <div>
            <p className="text-[12px] font-medium text-[#757575] uppercase tracking-wider">SLA Cumplido</p>
            <p className="text-[24px] font-bold text-[#212121]">{porcentaje}%</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.08)] border-l-4 border-[#F57F17] flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#FFF8E1] flex items-center justify-center">
            <Clock className="w-6 h-6 text-[#F57F17]" />
          </div>
          <div>
            <p className="text-[12px] font-medium text-[#757575] uppercase tracking-wider">Por Vencer (&lt; 2h)</p>
            <p className="text-[24px] font-bold text-[#212121]">{porVencer}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.08)] border-l-4 border-[#D32F2F] flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#FFEBEE] flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-[#D32F2F]" />
          </div>
          <div>
            <p className="text-[12px] font-medium text-[#757575] uppercase tracking-wider">SLA Incumplido</p>
            <p className="text-[24px] font-bold text-[#212121]">{incumplido}</p>
          </div>
        </div>
      </div>

      {/* Tabla de Prioridades */}
      <div className="bg-white rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.08)] overflow-hidden">
        <div className="p-4 border-b border-[#E0E0E0] bg-[#FAFAFA]">
          <h3 className="font-bold text-[#212121] flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-[#D32F2F]" /> 
            Tickets Críticos y en Riesgo
          </h3>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white border-b border-[#E0E0E0] text-[13px] text-[#757575]">
              <th className="p-4 font-medium">Ticket ID</th>
              <th className="p-4 font-medium">Problema</th>
              <th className="p-4 font-medium">Prioridad</th>
              <th className="p-4 font-medium">Tiempo Restante</th>
            </tr>
          </thead>
          <tbody>
            {ticketsProcesados.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-12 text-center text-[#757575] text-[14px]">
                  Excelente trabajo. No hay tickets activos en este momento.
                </td>
              </tr>
            ) : (
              ticketsProcesados.map((ticket) => (
                <tr key={ticket.id} className="border-b border-[#F5F5F5] hover:bg-[#FAFAFA]">
                  <td className="p-4 text-[13px] font-mono font-medium text-[#757575]">#{ticket.id}</td>
                  <td className="p-4 text-[14px] text-[#212121]">{ticket.titulo}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-[12px] font-medium ${
                      ticket.prioridad?.toLowerCase().includes('critica') ? 'bg-[#FFEBEE] text-[#D32F2F]' :
                      ticket.prioridad?.toLowerCase().includes('alta') ? 'bg-[#FFF3E0] text-[#E65100]' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {ticket.prioridad}
                    </span>
                  </td>
                  <td className="p-4 text-[13px] font-medium">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        ticket.estadoSla === 'breached' ? 'bg-[#D32F2F]' :
                        ticket.estadoSla === 'warning' ? 'bg-[#F57F17]' :
                        'bg-[#2E7D32]'
                      }`}></div>
                      <span className={ticket.estadoSla === 'breached' ? 'text-[#D32F2F]' : 'text-[#212121]'}>
                        {formatTimeLeft(ticket.horasRestantes)}
                      </span>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}