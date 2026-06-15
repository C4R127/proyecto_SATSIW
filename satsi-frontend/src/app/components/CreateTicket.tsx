import React, { useState, useEffect } from 'react';
import { Monitor, Wifi, CreditCard, HardDrive, Store, CheckCircle, Upload } from 'lucide-react';
import { useTickets } from '../context/TicketContext';
import { uploadTicketAttachment } from '../api/tickets';
import { apiFetch } from '../api/client';

export default function CreateTicket() {
  const { create } = useTickets();

  // Estados del formulario
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('');
  const [evidencia, setEvidencia] = useState<File | null>(null);
  
  // Estados dinámicos
  const [sucursales, setSucursales] = useState<any[]>([]);
  const [selectedSucursalId, setSelectedSucursalId] = useState<number | ''>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const [submitted, setSubmitted] = useState(false);
  const [ticketNumber, setTicketNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cargar sucursales desde el backend
  useEffect(() => {
    const cargarCatalogos = async () => {
      try {
        const dataSucursales = await apiFetch<any[]>('/api/sucursales');
        const listaSucursales = Array.isArray(dataSucursales) ? dataSucursales : [];
        setSucursales(listaSucursales);
        if (listaSucursales.length > 0) setSelectedSucursalId(listaSucursales[0].id);
      } catch (error) {
        console.error("Error cargando sucursales desde la base de datos:", error);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const ticket = await create({
        title,
        description,
        categoria: selectedCategory,
        priority: priority as 'low' | 'medium' | 'high' | 'critical',
        sucursalId: selectedSucursalId,
      } as any);

      if (evidencia && ticket.id) {
        await uploadTicketAttachment(ticket.id.toString(), evidencia);
      }

      setTicketNumber(ticket.id.toString());
      setSubmitted(true);
    } catch (error) {
      console.error("Error al crear el ticket:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateAnother = () => {
    setTitle('');
    setDescription('');
    setSelectedCategory('');
    setPriority('');
    if (sucursales.length > 0) setSelectedSucursalId(sucursales[0].id);
    setEvidencia(null);
    setSubmitted(false);
    setTicketNumber('');
  };

  if (submitted) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4 sm:p-8">
        <div className="w-full max-w-[720px] bg-white rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-6 sm:p-12 text-center">
          <div className="mb-6">
            <div className="w-16 h-20 sm:w-20 sm:h-20 rounded-full bg-[#E8F5E9] flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 text-[#2E7D32]" />
            </div>
            <h2 className="text-[20px] sm:text-[24px] font-semibold text-[#212121] mb-2">
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
            className="w-full sm:w-auto px-6 py-3 bg-[#D32F2F] text-white rounded-md font-medium text-[14px] hover:bg-[#B71C1C] transition-all"
          >
            Crear otro ticket
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4 sm:p-8">
      <div className="w-full max-w-[720px] bg-white rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-5 sm:p-8">
        <div className="mb-6">
          <h2 className="text-[20px] sm:text-[24px] font-semibold text-[#212121] mb-2">
            Reportar Nueva Incidencia
          </h2>
          <p className="text-[13px] sm:text-[14px] text-[#757575]">
            Completa el formulario para reportar tu problema desde tu estación o dispositivo móvil.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Título */}
          <div className="mb-5">
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
          <div className="mb-5">
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
          <div className="mb-5">
            <label className="block text-[14px] font-medium text-[#212121] mb-2">
              Evidencia del error (Opcional)
            </label>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-[#E0E0E0] border-dashed rounded-lg cursor-pointer bg-[#FAFAFA] hover:bg-[#F5F5F5] transition-colors p-4 text-center">
                <div className="flex flex-col items-center justify-center">
                  <Upload className="w-8 h-8 mb-2 text-[#757575]" />
                  <p className="mb-1 text-xs sm:text-sm text-[#757575]">
                    <span className="font-semibold text-[#D32F2F]">Presiona para tomar foto</span> o subir archivo
                  </p>
                  <p className="text-[11px] text-[#9E9E9E]">PNG, JPG o PDF (MAX. 5MB)</p>
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
              <p className="mt-2 text-sm text-[#2E7D32] font-medium break-all">
                ✓ Seleccionado: {evidencia.name}
              </p>
            )}
          </div>

          {/* Categoría Adaptable */}
          <div className="mb-5">
            <label className="block text-[14px] font-medium text-[#212121] mb-2">
              Categoría
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              {[
                { id: 'HARDWARE_CAJA', label: 'Hardware de Caja', icon: CreditCard },
                { id: 'REDES_CONECTIVIDAD', label: 'Redes / Conectividad', icon: Wifi },
                { id: 'COMPUTO_ESTACIONES', label: 'Terminal POS', icon: Monitor },
                { id: 'SOFTWARE_SISTEMAS', label: 'Software / Sistema', icon: HardDrive },
                { id: 'OTRAS', label: 'Otros', icon: Store }
              ].map((cat) => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex items-center gap-3 px-4 py-3 border rounded-md text-left text-[14px] transition-all ${
                      selectedCategory === cat.id
                        ? 'border-[#D32F2F] bg-[#FFEBEE] text-[#D32F2F]'
                        : 'border-[#E0E0E0] text-[#757575] hover:border-[#D32F2F]'
                    }`}
                  >
                    <Icon className={`w-5 h-5 flex-shrink-0 ${selectedCategory === cat.id ? 'text-[#D32F2F]' : 'text-[#757575]'}`} />
                    <span className="font-medium">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Prioridad Adaptable */}
          <div className="mb-6">
            <label className="block text-[14px] font-medium text-[#212121] mb-2">
              Nivel de Prioridad
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {priorities.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setPriority(p.value)}
                  className={`w-full py-2.5 rounded-[20px] text-[12px] font-medium transition-all text-center ${
                    priority === p.value ? 'ring-2 ring-offset-2' : 'opacity-75 hover:opacity-100'
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

          {/* Tienda / Sucursal */}
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

          {/* Botones de Acción Adaptables */}
          <div className="flex flex-col-reverse sm:flex-row gap-3">
            <button
              type="button"
              onClick={handleCreateAnother}
              className="w-full sm:w-auto sm:px-6 py-3 bg-white border border-[#D32F2F] text-[#D32F2F] rounded-md font-medium text-[14px] hover:bg-[#FFEBEE] transition-all text-center"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="w-full sm:flex-1 py-3 px-4 bg-[#D32F2F] text-white rounded-md font-medium text-[14px] hover:bg-[#B71C1C] transition-all disabled:bg-[#BDBDBD] disabled:cursor-not-allowed text-center"
              disabled={!title || !description || !selectedCategory || !priority || !selectedSucursalId || isSubmitting}
            >
              {isSubmitting ? 'Creando...' : 'Crear Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}