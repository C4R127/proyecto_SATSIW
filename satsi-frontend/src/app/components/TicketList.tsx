import { useNavigate } from 'react-router-dom';
import { useTickets } from '../context/TicketContext';

export default function TicketList() {
  const { tickets, isLoading } = useTickets();
  const navigate = useNavigate();

  // Función para pintar las etiquetas de estado bonitas (Con filtro de limpieza)
  const getStatusBadge = (rawStatus: string) => {
    const safeStatus = String(rawStatus || 'todo').toLowerCase().trim();
    switch (safeStatus) {
      case 'todo': 
      case 'abierto': 
        return <span className="px-3 py-1 bg-[#E3F2FD] text-[#1565C0] rounded-full text-[12px] font-medium">Abierto</span>;
      case 'in-progress': 
      case 'en_progreso': 
        return <span className="px-3 py-1 bg-[#FFF8E1] text-[#F57F17] rounded-full text-[12px] font-medium">En Progreso</span>;
      case 'resolved': 
      case 'resuelto': 
        return <span className="px-3 py-1 bg-[#E8F5E9] text-[#2E7D32] rounded-full text-[12px] font-medium">Resuelto</span>;
      default: 
        return <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-[12px] font-medium">{rawStatus}</span>;
    }
  };

  // Función para los colores de prioridad (Con filtro de limpieza)
  const getPriorityBadge = (rawPriority: string) => {
    const safePriority = String(rawPriority || 'low').toLowerCase().trim();
    switch (safePriority) {
      case 'low': return <span className="text-[#2E7D32] font-medium text-[13px]">Baja</span>;
      case 'medium': return <span className="text-[#F57F17] font-medium text-[13px]">Media</span>;
      case 'high': return <span className="text-[#E65100] font-medium text-[13px]">Alta</span>;
      case 'critical': return <span className="text-[#C62828] font-bold text-[13px]">Crítica</span>;
      default: return <span className="text-gray-600 text-[13px]">{rawPriority}</span>;
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-[#757575]">Cargando tus tickets...</div>;
  }

  return (
    <div className="p-8">
      {/* Cabecera */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-[24px] font-semibold text-[#212121]">Mis Tickets</h2>
          <p className="text-[14px] text-[#757575]">Historial de incidencias reportadas</p>
        </div>
        <button
          onClick={() => navigate('/tickets/new')}
          className="px-4 py-2 bg-[#D32F2F] text-white rounded-md text-[14px] font-medium hover:bg-[#B71C1C] transition-colors"
        >
          + Nuevo Ticket
        </button>
      </div>

      {/* Tabla de Tickets */}
      <div className="bg-white rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.08)] overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F5F5F5] border-b border-[#E0E0E0] text-[13px] text-[#757575]">
              <th className="p-4 font-medium">ID</th>
              <th className="p-4 font-medium">Título del Problema</th>
              <th className="p-4 font-medium">Categoría</th>
              <th className="p-4 font-medium">Prioridad</th>
              <th className="p-4 font-medium">Estado</th>
              <th className="p-4 font-medium">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {tickets.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-12 text-center text-[#757575] text-[14px]">
                  No tienes ningún ticket reportado aún.
                </td>
              </tr>
            ) : (
              tickets.map((ticket) => {
                // Buscamos la prioridad por si Java la envía como "priority" o "prioridad"
                const ticketPriority = ticket.priority;
                
                return (
                  <tr
                    key={ticket.id}
                    onClick={() => navigate(`/tickets/${ticket.id}`)}
                    className="border-b border-[#F5F5F5] hover:bg-[#FAFAFA] cursor-pointer transition-colors"
                  >
                    <td className="p-4 text-[13px] text-[#757575]">#{ticket.id}</td>
                    <td className="p-4 text-[14px] font-medium text-[#212121]">{ticket.title}</td>
                    <td className="p-4 text-[13px] text-[#757575]">{ticket.category}</td>
                    <td className="p-4">{getPriorityBadge(ticketPriority)}</td>
                    <td className="p-4">{getStatusBadge(ticket.status)}</td>
                    <td className="p-4 text-[13px] text-[#757575]">
                      {ticket.createdDate ? new Date(ticket.createdDate).toLocaleDateString() : '-'}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}