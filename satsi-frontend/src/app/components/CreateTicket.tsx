import React, { useState, useEffect } from 'react';
import { Monitor, Wifi, CreditCard, HardDrive, Store, CheckCircle } from 'lucide-react';
import { useTickets } from '../context/TicketContext';
import { uploadTicketAttachment } from '../api/tickets';
import { apiFetch } from '../api/client';

export default function CreateTicket() {
  const { create } = useTickets();

  // Estados originales del formulario
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('');
  const [evidencia, setEvidencia] = useState<File | null>(null);
  
  // NUEVOS ESTADOS DINÁMICOS
  const [sucursales, setSucursales] = useState<any[]>([]);
  const [equipos, setEquipos] = useState<any[]>([]);
  const [selectedSucursalId, setSelectedSucursalId] = useState<number | ''>('');
  const [selectedEquipoId, setSelectedEquipoId] = useState<number | ''>('');

  const [submitted, setSubmitted] = useState(false);
  const [ticketNumber, setTicketNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // EFECTO PARA CARGAR DATOS DESDE JAVA AL ABRIR LA PANTALLA
  useEffect(() => {
    const cargarCatalogos = async () => {
      try {
        // 1. Cargar Sucursales usando apiFetch (pasa el Token de seguridad)
        const dataSucursales = await apiFetch<any[]>('http://localhost:8082/api/sucursales');
        const listaSucursales = Array.isArray(dataSucursales) ? dataSucursales : [];
        setSucursales(listaSucursales);
        if (listaSucursales.length > 0) setSelectedSucursalId(listaSucursales[0].id);

        // 2. Cargar Equipos usando apiFetch (pasa el Token de seguridad)
        const dataEquipos = await apiFetch<any[]>('http://localhost:8082/api/equipos');
        setEquipos(Array.isArray(dataEquipos) ? dataEquipos : []);

      } catch (error) {
        console.error("Error cargando catálogos desde la base de datos:", error);
      }
    };

    cargarCatalogos();
  }, []);

  const priorities = [
    { value: 'low', label: 'Baja', bg: '#E8F5E9', text: '#2E7D32' },
    { value: 'medium', label: 'Media', bg: '#FFF8E1', text: '#F57F17' },
    { value: 'high', label: 'Alta', bg: '#FFF3E0', text: '#E65100' },
    { value: 'critical', label: 'Crítica', bg: '#FFEBEE', text: '#C62828' },
  ];

  // Función para darle un ícono dinámico a los equipos que vienen de Java
  const getDeviceIcon = (tipo: string) => {
    const safeTipo = String(tipo).toLowerCase();
    if (safeTipo.includes('pos') || safeTipo.includes('caja')) return <CreditCard className="w-5 h-5" />;
    if (safeTipo.includes('servidor')) return <HardDrive className="w-5 h-5" />;
    if (safeTipo.includes('router') || safeTipo.includes('red')) return <Wifi className="w-5 h-5" />;
    return <Monitor className="w-5 h-5" />;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 1. Creamos el ticket enviando los IDs seleccionados a la base de datos
      const ticket = await create({
        title,
        description,
        equipoId: selectedEquipoId,
        priority: priority as 'low' | 'medium' | 'high' | 'critical',
        sucursalId: selectedSucursalId,
      } as any);

      // 2. Subimos la foto si el usuario seleccionó una
      if (evidencia && ticket.id) {
        await uploadTicketAttachment(ticket.id.toString(), evidencia);
      }

      // 3. Flujo de éxito
      setTicketNumber(ticket.id.toString());
      setSubmitted(true);
    } catch (error) {
      console.error("Error al crear el ticket o subir la evidencia:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateAnother = () => {
    setTitle('');
    setDescription('');
    setSelectedEquipoId('');
    setPriority('');
    if (sucursales.length > 0) setSelectedSucursalId(sucursales[0].id);
    setEvidencia(null);
    setSubmitted(false);
    setTicketNumber('');
  };

  if (submitted) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-8">
        <div className="w-full max-w-[720px] bg-white rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-12 text-center">
          <div className="mb-6">
            <div className="w-20 h-20 rounded-full bg-[#E8F5E9] flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-12 h-12 text-[#2E7D32]" />
            </div>
            <h2 className="text-[24px] font-semibold text-[#212121] mb-2">
              ¡Ticket creado exitosamente!
            </h2>
            <p className="text-[14px] text-[#757575] mb-1">
              Tu ticket <span className="font-semibold text-[#D32F2F]">#{ticketNumber}</span> fue registrado.
            </p>
            <p className="text-[14px] text-[#757575]">
              Un técnico lo atenderá pronto.
            </p>
          </div>
          <button
            onClick={handleCreateAnother}
            className="px-6 py-3 bg-[#D32F2F] text-white rounded-md font-medium text-[14px] hover:bg-[#B71C1C] transition-all"
          >
            Crear otro ticket
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-8">
      <div className="w-full max-w-[720px] bg-white rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-8">
        <div className="mb-6">
          <h2 className="text-[24px] font-semibold text-[#212121] mb-2">
            Reportar Nueva Incidencia
          </h2>
          <p className="text-[14px] text-[#757575]">
            Completa el formulario para reportar tu problema. Serás atendido lo antes posible.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Título */}
          <div className="mb-6">
            <label className="block text-[14px] font-medium text-[#212121] mb-2">
              Título del problema
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Caja N°3 no enciende"
              className="w-full px-4 py-3 border border-[#E0E0E0] rounded-md text-[14px] focus:outline-none focus:border-[#D32F2F]"
              required
            />
          </div>

          {/* Descripción */}
          <div className="mb-6">
            <label className="block text-[14px] font-medium text-[#212121] mb-2">
              Descripción detallada
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe el problema con el mayor detalle posible..."
              rows={4}
              className="w-full px-4 py-3 border border-[#E0E0E0] rounded-md text-[14px] focus:outline-none focus:border-[#D32F2F] resize-none"
              required
            />
          </div>

          {/* Evidencia */}
          <div className="mb-6">
            <label className="block text-[14px] font-medium text-[#212121] mb-2">
              Evidencia del error (Opcional)
            </label>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-[#E0E0E0] border-dashed rounded-lg cursor-pointer bg-[#FAFAFA] hover:bg-[#F5F5F5] transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg className="w-8 h-8 mb-3 text-[#757575]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="mb-2 text-sm text-[#757575]">
                    <span className="font-semibold text-[#D32F2F]">Haz clic para subir</span> o arrastra tu foto aquí
                  </p>
                  <p className="text-xs text-[#9E9E9E]">PNG, JPG o PDF (MAX. 5MB)</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/png, image/jpeg, application/pdf"
                  onChange={(e) => setEvidencia(e.target.files ? e.target.files[0] : null)}
                />
              </label>
            </div>
            {evidencia && (
              <p className="mt-2 text-sm text-[#2E7D32] font-medium">
                ✓ Archivo seleccionado: {evidencia.name}
              </p>
            )}
          </div>

          {/* Categoría / Equipos (DINÁMICO) */}
          <div className="mb-6">
            <label className="block text-[14px] font-medium text-[#212121] mb-2">
              Equipo a reportar
            </label>
            <div className="grid grid-cols-1 gap-2">
              {equipos.length === 0 && <p className="text-[13px] text-gray-500">Cargando equipos desde la base de datos...</p>}
              {equipos.map((equipo) => (
                <button
                  key={equipo.id}
                  type="button"
                  onClick={() => setSelectedEquipoId(equipo.id)}
                  className={`flex items-center gap-3 px-4 py-3 border rounded-md text-left text-[14px] transition-all ${
                    selectedEquipoId === equipo.id
                      ? 'border-[#D32F2F] bg-[#FFEBEE] text-[#D32F2F]'
                      : 'border-[#E0E0E0] text-[#757575] hover:border-[#D32F2F]'
                  }`}
                >
                  {getDeviceIcon(equipo.tipo)}
                  <span>{equipo.tipo} - {equipo.marca} <span className="text-[#9E9E9E] ml-1">(Inv: {equipo.codigoInventario})</span></span>
                </button>
              ))}
            </div>
          </div>

          {/* Prioridad */}
          <div className="mb-6">
            <label className="block text-[14px] font-medium text-[#212121] mb-2">
              Nivel de Prioridad
            </label>
            <div className="grid grid-cols-4 gap-2">
              {priorities.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setPriority(p.value)}
                  className={`px-4 py-2 rounded-[20px] text-[12px] font-medium transition-all ${
                    priority === p.value ? 'ring-2 ring-offset-2' : 'opacity-60 hover:opacity-100'
                  }`}
                  style={{
                    backgroundColor: p.bg,
                    color: p.text,
                    ...(priority === p.value && { ringColor: p.text }),
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tienda / Sucursal (DINÁMICO) */}
          <div className="mb-6">
            <label className="flex items-center gap-2 text-[14px] font-medium text-[#212121] mb-2">
              <Store className="w-4 h-4 text-[#757575]" />
              Tienda / Sucursal
            </label>
            <select
              value={selectedSucursalId}
              onChange={(e) => setSelectedSucursalId(Number(e.target.value))}
              className="w-full px-4 py-3 border border-[#E0E0E0] rounded-md text-[14px] focus:outline-none focus:border-[#D32F2F] bg-white cursor-pointer"
              required
            >
              <option value="" disabled>Selecciona una sucursal...</option>
              {sucursales.map(sucursal => (
                <option key={sucursal.id} value={sucursal.id}>
                  {sucursal.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Botones */}
          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 py-3 px-4 bg-[#D32F2F] text-white rounded-md font-medium text-[14px] hover:bg-[#B71C1C] transition-all disabled:bg-[#BDBDBD] disabled:cursor-not-allowed"
              disabled={!title || !description || !selectedEquipoId || !priority || !selectedSucursalId || isSubmitting}
            >
              {isSubmitting ? 'Creando...' : 'Crear Ticket'}
            </button>
            <button
              type="button"
              onClick={handleCreateAnother}
              className="px-6 py-3 bg-white border border-[#D32F2F] text-[#D32F2F] rounded-md font-medium text-[14px] hover:bg-[#FFEBEE] transition-all"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}