import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ChevronRight,
  Monitor,
  Calendar,
  Clock,
  User,
  PlusCircle,
  UserCheck,
  MessageCircle,
  RefreshCw,
  CheckCircle,
} from 'lucide-react';
import { useTickets } from '../context/TicketContext';
import type { Ticket, TicketStatus, TicketTimelineEvent } from '../types';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../api/client'; // NUEVO: Importamos apiFetch para la conexión directa

export default function TicketDetail() {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const { findById, addComment } = useTickets();
  const [comment, setComment] = useState('');
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { user } = useAuth();
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  useEffect(() => {
    let isMounted = true;
    if (!ticketId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    findById(ticketId)
      .then((data: Ticket | null) => {
        if (isMounted) {
          setTicket(data);
          if (data) {
            setSelectedStatus(data.status || (data as any).estado);
          }
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [ticketId, findById]);

  const canManageTicket = user?.role === 'technician' || user?.role === 'manager' || user?.role === 'sysadmin';

  const statusColors = {
    todo: { bg: '#E3F2FD', text: '#1565C0', label: 'Abierto' },
    abierto: { bg: '#E3F2FD', text: '#1565C0', label: 'Abierto' },
    'in-progress': { bg: '#FFF8E1', text: '#F57F17', label: 'En Progreso' },
    en_progreso: { bg: '#FFF8E1', text: '#F57F17', label: 'En Progreso' },
    resolved: { bg: '#E8F5E9', text: '#2E7D32', label: 'Resuelto' },
    resuelto: { bg: '#E8F5E9', text: '#2E7D32', label: 'Resuelto' },
    closed: { bg: '#F5F5F5', text: '#616161', label: 'Cerrado' },
    cerrado: { bg: '#F5F5F5', text: '#616161', label: 'Cerrado' },
  };

  const priorityColors = {
    low: { bg: '#E8F5E9', text: '#2E7D32', label: 'Baja' },
    medium: { bg: '#FFF8E1', text: '#F57F17', label: 'Media' },
    high: { bg: '#FFF3E0', text: '#E65100', label: 'Alta' },
    critical: { bg: '#FFEBEE', text: '#C62828', label: 'Crítica' },
  };

  const timeline = useMemo<(TicketTimelineEvent & { icon: typeof PlusCircle; color: string })[]>(() => {
    if (!ticket || !ticket.timeline) {
      return [];
    }

    return ticket.timeline.map((event: TicketTimelineEvent) => {
      if (event.type === 'created') return { ...event, icon: PlusCircle, color: '#1565C0' };
      if (event.type === 'assigned') return { ...event, icon: UserCheck, color: '#E65100' };
      if (event.type === 'comment') return { ...event, icon: MessageCircle, color: '#757575' };
      return { ...event, icon: RefreshCw, color: '#F57F17' };
    });
  }, [ticket]);

  const rawStatus = ticket?.status || (ticket as any)?.estado || 'todo';
  const safeStatus = String(rawStatus).toLowerCase().trim();
  const statusStyle = statusColors[safeStatus as keyof typeof statusColors] || statusColors.todo;

  const rawPriority = ticket?.priority || (ticket as any)?.prioridad || 'low';
  const safePriority = String(rawPriority).toLowerCase().trim();
  const priorityStyle = priorityColors[safePriority as keyof typeof priorityColors] || priorityColors.medium;

  // NUEVO: Función para actualizar el estado del ticket en Java
  // NUEVO: Función para actualizar el estado del ticket en Java
  const handleConfirmStatus = async () => {
    if (!ticket) return;
    try {
      // 1. Sacamos tu "Pase VIP" de Técnico con la llave correcta
      const token = localStorage.getItem('jwt_token'); 
      
      // 2. Traducimos lo que diga tu lista desplegable a lo que Java entiende
      let estadoJava = 'ABIERTO';
      // 👇 AQUÍ ESTÁ LA CORRECCIÓN: Usamos selectedStatus en lugar del undefined newStatus
      const estadoSeguro = selectedStatus.toLowerCase(); 
      if (estadoSeguro.includes('progreso') || estadoSeguro.includes('in-progress')) estadoJava = 'EN_PROGRESO';
      else if (estadoSeguro.includes('resuelto') || estadoSeguro.includes('resolved')) estadoJava = 'RESUELTO';
      else if (estadoSeguro.includes('cerrado') || estadoSeguro.includes('closed')) estadoJava = 'CERRADO';

      // 3. Enviamos el método PUT a la fuerza, inyectando el token seguro
      const response = await fetch(`http://localhost:8080/api/tickets/${ticket.id}/estado?estado=${estadoJava}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        console.error("❌ Java rechazó el cambio. Código:", response.status);
        throw new Error('Error al actualizar');
      }

      // 4. ¡Éxito! Recargamos la pantalla para ver el nuevo estado
      window.location.reload();
      
    } catch (error) {
      console.error("Error al actualizar el estado en Java:", error);
    }
  };

  const handleAddComment = async () => {
    if (!ticket || !comment.trim()) return;
    const updated = await addComment(ticket.id, comment.trim());
    setTicket(updated);
    setComment('');
  };

  if (isLoading) {
    return <div className="p-8 text-[14px] text-[#757575]">Cargando ticket...</div>;
  }

  if (!ticket) {
    return <div className="p-8 text-[14px] text-[#757575]">Ticket no encontrado.</div>;
  }

  // NUEVO: Imprimimos el ticket en la consola para ver qué trae adentro
  console.log("Datos del ticket cargado:", ticket);

  return (
    <div className="p-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6 text-[14px]">
        <button
          onClick={() => navigate(user?.role === 'store' ? '/tickets' : '/kanban')}
          className="text-[#757575] hover:text-[#D32F2F] transition-colors"
        >
          Mis Tickets
        </button>
        <ChevronRight className="w-4 h-4 text-[#757575]" />
        <span className="text-[#D32F2F] font-medium">#{ticket.id}</span>
      </div>

      {/* Botones de Acción */}
      {canManageTicket && (
        <div className="flex gap-3 mb-6">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-[#E0E0E0] rounded-md text-[14px] font-medium focus:outline-none focus:border-[#D32F2F]"
          >
            <option value="todo">Abierto</option>
            <option value="in-progress">En Progreso</option>
            <option value="resolved">Resuelto</option>
            <option value="closed">Cerrado</option>
          </select>

          <button
            onClick={handleConfirmStatus}
            disabled={selectedStatus === rawStatus}
            className={`px-6 py-2 rounded-md text-[14px] font-medium transition-all ${selectedStatus !== rawStatus
                ? 'bg-[#D32F2F] text-white hover:bg-[#B71C1C] border border-[#D32F2F]'
                : 'bg-[#F5F5F5] text-[#BDBDBD] border border-[#E0E0E0] cursor-not-allowed'
              }`}
          >
            Actualizar Estado
          </button>
        </div>
      )}

      <div className="grid grid-cols-[1fr,400px] gap-6">
        {/* Left Column - Ticket Info */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-6">
            <h2 className="text-[24px] font-semibold text-[#212121] mb-4">
              {ticket.title || (ticket as any).titulo}
            </h2>

            {/* Metadata */}
            <div className="flex items-center gap-3 mb-6">
              <span
                className="px-3 py-1 rounded-[20px] text-[12px] font-medium"
                style={{ backgroundColor: statusStyle.bg, color: statusStyle.text }}
              >
                {statusStyle.label}
              </span>
              <span
                className="px-3 py-1 rounded-[20px] text-[12px] font-medium"
                style={{ backgroundColor: priorityStyle.bg, color: priorityStyle.text }}
              >
                {priorityStyle.label}
              </span>
              <div className="flex items-center gap-2 text-[12px] text-[#757575]">
                <Monitor className="w-4 h-4" />
                <span>{ticket.category || (ticket as any).categoria || 'Hardware'}</span>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h3 className="text-[18px] font-semibold text-[#212121] mb-3">Descripción</h3>
              <p className="text-[14px] text-[#757575] leading-relaxed">
                {ticket.description || (ticket as any).descripcion}
              </p>
            </div>

            {/* Evidencia Multimedia adjunta */}
            {ticket.attachments && ticket.attachments.length > 0 && (
              <div className="mt-8">
                <h3 className="text-[16px] font-bold text-[#212121] mb-4">Evidencia Multimedia adjunta</h3>
                <div className="grid grid-cols-2 gap-4">
                  {ticket.attachments.map((file: any) => (
                    <div key={file.id} className="border border-[#E0E0E0] rounded-lg p-2 bg-[#FAFAFA]">
                      <p className="text-[12px] text-[#757575] mb-2 truncate font-medium">{file.name}</p>
                      <img
                        src={file.url}
                        alt={file.name}
                        className="w-full h-48 object-contain bg-[#E0E0E0] rounded"
                        onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/400x200?text=Documento+No+Es+Imagen')}
                      />
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 block text-center text-[13px] text-[#D32F2F] hover:underline font-medium"
                      >
                        Abrir archivo original
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-6 mt-8 border-t border-[#E0E0E0] pt-6">
              <div>
                <div className="flex items-center gap-2 text-[12px] text-[#757575] mb-1">
                  <User className="w-4 h-4" />
                  <span>Creado por</span>
                </div>
                <p className="text-[14px] text-[#212121] font-medium">
                  {ticket.createdBy || (ticket as any).usuarioUsername}
                </p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-[12px] text-[#757575] mb-1">
                  <UserCheck className="w-4 h-4" />
                  <span>Técnico asignado</span>
                </div>
                {/* NUEVO: Aquí se lee la columna tecnicoAsignado de la base de datos */}
                <p className="text-[14px] text-[#212121] font-medium">
                  {(ticket as any).tecnicoAsignado || ticket.assignedTo || 'Sin asignar'}
                </p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-[12px] text-[#757575] mb-1">
                  <Calendar className="w-4 h-4" />
                  <span>Fecha creación</span>
                </div>
                <p className="text-[14px] text-[#212121] font-medium">
                  {ticket.createdDate || (ticket as any).fechaCreacion ? new Date(ticket.createdDate || (ticket as any).fechaCreacion).toLocaleDateString() : '-'}
                </p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-[12px] text-[#757575] mb-1">
                  <Clock className="w-4 h-4" />
                  <span>Vencimiento SLA</span>
                </div>
                <p className="text-[14px] text-[#212121] font-medium">
                  {ticket.dueDate ? new Date(ticket.dueDate).toLocaleDateString() : '-'}
                </p>
              </div>
            </div>
          </div>

          {/* Comment Section */}
          <div className="bg-white rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-6">
            <h3 className="text-[18px] font-semibold text-[#212121] mb-4">
              Agregar Comentario
            </h3>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Escribe un comentario sobre el progreso del ticket..."
              rows={4}
              className="w-full px-4 py-3 border border-[#E0E0E0] rounded-md text-[14px] focus:outline-none focus:border-[#D32F2F] resize-none mb-4"
            />
            <div className="flex justify-end">
              <button
                onClick={handleAddComment}
                className="px-6 py-2 bg-[#D32F2F] text-white rounded-md text-[14px] font-medium hover:bg-[#B71C1C] transition-all"
              >
                Publicar Comentario
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Timeline */}
        <div className="bg-white rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-6">
          <h3 className="text-[18px] font-semibold text-[#212121] mb-6">
            Historial de Actividad
          </h3>

          <div className="space-y-6">
            {timeline.length === 0 && (
              <p className="text-[14px] text-[#757575]">Aún no hay actividad registrada.</p>
            )}

            {timeline.map((event, index) => {
              const Icon = event.icon;
              return (
                <div key={index} className="relative pl-8">
                  {index < timeline.length - 1 && (
                    <div className="absolute left-[11px] top-8 bottom-[-24px] w-[2px] bg-[#E0E0E0]" />
                  )}
                  <div
                    className="absolute left-0 top-0 w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: event.color }}
                  >
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-[14px] font-medium text-[#212121] mb-1">
                      {event.title}
                    </p>
                    {event.description && (
                      <p className="text-[12px] text-[#757575] mb-2 p-3 bg-[#F5F5F5] rounded-md">
                        {event.description}
                      </p>
                    )}
                    <p className="text-[12px] text-[#757575]">{event.date}</p>
                  </div>
                </div>
              );
            })}

            {safeStatus !== 'resolved' && safeStatus !== 'closed' && safeStatus !== 'resuelto' && safeStatus !== 'cerrado' && (
              <div className="relative pl-8 opacity-40">
                <div className="absolute left-0 top-0 w-6 h-6 rounded-full flex items-center justify-center bg-[#2E7D32]">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-[14px] font-medium text-[#212121] mb-1">
                    Estado Final → Resuelto
                  </p>
                  <p className="text-[12px] text-[#757575]">Pendiente...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}