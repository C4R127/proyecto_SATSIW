import { useEffect, useState } from 'react';
import { Laptop, Server, Router, Plus, Search, X } from 'lucide-react';
import { apiFetch } from '../api/client';


export interface Sucursal {
  id: number;
  nombre: string;
  direccion: string;
  activa: boolean;
}

export interface Equipo {
  id: number;
  codigoInventario: string;
  tipo: string;
  marca: string;
  modelo: string;
  estado: string;
  fechaRegistro: string;
  sucursal: Sucursal;
}

export default function Inventory() {
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Estados para el Modal de Nuevo Equipo
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newEquipo, setNewEquipo] = useState({
    tipo: 'Hardware de Caja',
    marca: '',
    modelo: '',
    sucursalId: ''
  });

  const fetchEquipos = async () => {
    try {
      // Petición directa al microservicio con el Token JWT inyectado
      const data = await apiFetch<Equipo[]>('http://localhost:8082/api/equipos');
      setEquipos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error cargando inventario:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSucursales = async () => {
    try {
      const data = await apiFetch<Sucursal[]>('http://localhost:8082/api/sucursales');
      const list = Array.isArray(data) ? data : [];
      setSucursales(list);
      if(list.length > 0) {
        setNewEquipo(prev => ({ ...prev, sucursalId: list[0].id.toString() }));
      }
    } catch (error) {
      console.error("Error cargando sucursales:", error);
    }
  };

  useEffect(() => {
    fetchEquipos();
    fetchSucursales();
  }, []);

  const handleCrearEquipo = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        tipo: newEquipo.tipo,
        marca: newEquipo.marca,
        modelo: newEquipo.modelo,
        sucursal: { id: Number(newEquipo.sucursalId) } // Relacionamos con la tabla Sucursales
      };

      await apiFetch('http://localhost:8082/api/equipos', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      // Cerramos modal y recargamos
      setIsModalOpen(false);
      setNewEquipo({ tipo: 'Hardware de Caja', marca: '', modelo: '', sucursalId: sucursales[0]?.id.toString() || '' });
      fetchEquipos(); 
    } catch (error) {
      console.error("Error al crear equipo:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (estado: string) => {
    const safeStatus = String(estado).toUpperCase().trim();
    switch (safeStatus) {
      case 'OPERATIVO': return <span className="px-3 py-1 bg-[#E8F5E9] text-[#2E7D32] rounded-full text-[12px] font-medium">Operativo</span>;
      case 'MANTENIMIENTO': return <span className="px-3 py-1 bg-[#FFF8E1] text-[#F57F17] rounded-full text-[12px] font-medium">Mantenimiento</span>;
      case 'DADO DE BAJA': return <span className="px-3 py-1 bg-[#FFEBEE] text-[#C62828] rounded-full text-[12px] font-medium">Dado de Baja</span>;
      default: return <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-[12px] font-medium">{estado}</span>;
    }
  };

  const getDeviceIcon = (tipo: string) => {
    const safeTipo = String(tipo).toLowerCase();
    if (safeTipo.includes('pos') || safeTipo.includes('caja')) return <Laptop className="w-5 h-5 text-[#1565C0]" />;
    if (safeTipo.includes('servidor')) return <Server className="w-5 h-5 text-[#E65100]" />;
    if (safeTipo.includes('router') || safeTipo.includes('red')) return <Router className="w-5 h-5 text-[#2E7D32]" />;
    return <Laptop className="w-5 h-5 text-[#757575]" />;
  };

  if (isLoading) {
    return <div className="p-8 text-center text-[#757575]">Cargando inventario de activos...</div>;
  }

  return (
    <div className="p-8 space-y-8">
      {/* SECCIÓN 1: INVENTARIO DE EQUIPOS */}
      <div>
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-[24px] font-bold text-[#212121] mb-2">Inventario de Activos</h1>
            <p className="text-[14px] text-[#757575]">Gestión centralizada de hardware y equipos de tienda</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#D32F2F] text-white rounded-md text-[14px] font-medium hover:bg-[#B71C1C] transition-colors"
          >
            <Plus className="w-4 h-4" /> Nuevo Equipo
          </button>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.08)] mb-6 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 translate-y-[-50%] w-5 h-5 text-[#757575]" />
            <input type="text" placeholder="Buscar por código, marca, modelo o sucursal..." className="w-full pl-10 pr-4 py-2 border border-[#E0E0E0] rounded-md text-[14px] focus:outline-none focus:border-[#D32F2F]" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.08)] overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F5F5F5] border-b border-[#E0E0E0] text-[13px] text-[#757575]">
                <th className="p-4 font-medium">Equipo</th>
                <th className="p-4 font-medium">Código Inventario</th>
                <th className="p-4 font-medium">Marca / Modelo</th>
                <th className="p-4 font-medium">Ubicación (Sucursal)</th>
                <th className="p-4 font-medium">Estado Operativo</th>
              </tr>
            </thead>
            <tbody>
              {equipos.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-[#757575] text-[14px]">No hay equipos registrados en la base de datos.</td>
                </tr>
              ) : (
                equipos.map((equipo) => (
                  <tr key={equipo.id} className="border-b border-[#F5F5F5] hover:bg-[#FAFAFA] transition-colors">
                    <td className="p-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#F5F5F5] flex items-center justify-center">
                        {getDeviceIcon(equipo.tipo)}
                      </div>
                      <div>
                        <p className="text-[14px] font-medium text-[#212121]">{equipo.tipo}</p>
                        <p className="text-[12px] text-[#757575]">ID Interno: {equipo.id}</p>
                      </div>
                    </td>
                    <td className="p-4 text-[13px] font-mono text-[#D32F2F] font-medium">{equipo.codigoInventario}</td>
                    <td className="p-4">
                      <p className="text-[14px] text-[#212121]">{equipo.marca}</p>
                      <p className="text-[12px] text-[#757575]">{equipo.modelo}</p>
                    </td>
                    <td className="p-4 text-[13px] text-[#212121] font-medium">{equipo.sucursal?.nombre || 'Sin Asignar'}</td>
                    <td className="p-4">{getStatusBadge(equipo.estado)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      

      {/* MODAL PARA NUEVO EQUIPO (¡El código perdido ha vuelto!) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-[18px] font-bold text-[#212121]">Registrar Nuevo Equipo</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-[#757575] hover:text-[#212121]">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCrearEquipo} className="space-y-4">
              <div>
                <label className="block text-[12px] font-medium text-[#757575] mb-1">Tipo de Equipo</label>
                <select 
                  value={newEquipo.tipo}
                  onChange={(e) => setNewEquipo({...newEquipo, tipo: e.target.value})}
                  className="w-full border border-[#E0E0E0] rounded p-2 text-[14px] focus:outline-none focus:border-[#D32F2F]"
                >
                  <option value="Hardware de Caja">Hardware de Caja</option>
                  <option value="Terminal POS">Terminal POS</option>
                  <option value="Redes / Conectividad">Redes / Conectividad</option>
                  <option value="Servidor Local">Servidor Local</option>
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-medium text-[#757575] mb-1">Marca</label>
                  <input type="text" required value={newEquipo.marca} onChange={(e) => setNewEquipo({...newEquipo, marca: e.target.value})} className="w-full border border-[#E0E0E0] rounded p-2 text-[14px] focus:outline-none focus:border-[#D32F2F]" placeholder="Ej: Toshiba" />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-[#757575] mb-1">Modelo</label>
                  <input type="text" required value={newEquipo.modelo} onChange={(e) => setNewEquipo({...newEquipo, modelo: e.target.value})} className="w-full border border-[#E0E0E0] rounded p-2 text-[14px] focus:outline-none focus:border-[#D32F2F]" placeholder="Ej: SurePOS 700" />
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[#757575] mb-1">Asignar a Sucursal</label>
                <select 
                  required
                  value={newEquipo.sucursalId}
                  onChange={(e) => setNewEquipo({...newEquipo, sucursalId: e.target.value})}
                  className="w-full border border-[#E0E0E0] rounded p-2 text-[14px] focus:outline-none focus:border-[#D32F2F]"
                >
                  <option value="" disabled>Seleccione una tienda...</option>
                  {sucursales.map(s => (
                    <option key={s.id} value={s.id}>{s.nombre}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-4 border-t border-[#E0E0E0]">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2 text-[#757575] hover:bg-[#F5F5F5] rounded text-[14px] font-medium transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={isSubmitting} className="flex-1 py-2 bg-[#D32F2F] text-white rounded text-[14px] font-medium hover:bg-[#B71C1C] transition-colors disabled:opacity-50">
                  {isSubmitting ? 'Guardando...' : 'Guardar Equipo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}