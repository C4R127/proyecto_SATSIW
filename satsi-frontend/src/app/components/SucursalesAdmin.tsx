import React, { useState, useEffect } from 'react';
import { Store, MapPin } from 'lucide-react';
import { apiFetch } from '../api/client';

export interface Sucursal {
  id?: number;
  nombre: string;
  direccion: string;
}

export default function SucursalesAdmin() {
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [nombre, setNombre] = useState('');
  const [direccion, setDireccion] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchSucursales = async () => {
    try {
      const data = await apiFetch<Sucursal[]>('http://localhost:8082/api/sucursales');
      setSucursales(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error al cargar sucursales:', error);
    }
  };

  useEffect(() => {
    fetchSucursales();
  }, []);

  const handleCrearSucursal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;

    setLoading(true);
    try {
      await apiFetch('http://localhost:8082/api/sucursales', {
        method: 'POST',
        body: JSON.stringify({ nombre, direccion })
      });

      setNombre('');
      setDireccion('');
      fetchSucursales();
    } catch (error) {
      console.error('Error al guardar sucursal:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-8">
      {/* Cabecera */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-[24px] font-bold text-[#212121] mb-2">Mantenimiento de Sucursales</h1>
          <p className="text-[14px] text-[#757575]">Gestión de tiendas y ubicaciones del sistema</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-6">
        {/* Formulario */}
        <form onSubmit={handleCrearSucursal} className="mb-8 flex gap-4 items-end pb-8 border-b border-[#E0E0E0]">
          <div className="flex-1">
            <label className="block text-[12px] font-medium text-[#757575] mb-1">Nombre de Tienda</label>
            <input 
              type="text" 
              value={nombre} 
              onChange={(e) => setNombre(e.target.value)}
              className="w-full border border-[#E0E0E0] rounded p-2 text-[14px] focus:outline-none focus:border-[#D32F2F]" 
              placeholder="Ej: Wong Plaza Norte"
              required
            />
          </div>
          <div className="flex-1">
            <label className="block text-[12px] font-medium text-[#757575] mb-1">Dirección (Opcional)</label>
            <input 
              type="text" 
              value={direccion} 
              onChange={(e) => setDireccion(e.target.value)}
              className="w-full border border-[#E0E0E0] rounded p-2 text-[14px] focus:outline-none focus:border-[#D32F2F]" 
              placeholder="Ej: Tomas Valle 123"
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="bg-[#D32F2F] text-white px-6 py-2 rounded text-[14px] font-medium hover:bg-[#B71C1C] disabled:opacity-50 transition-colors"
          >
            {loading ? 'Guardando...' : 'Agregar Sucursal'}
          </button>
        </form>

        {/* Tabla */}
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F5F5F5] border-b border-[#E0E0E0] text-[13px] text-[#757575]">
              <th className="p-4 font-medium">ID</th>
              <th className="p-4 font-medium">Nombre de la Sucursal</th>
              <th className="p-4 font-medium">Dirección</th>
            </tr>
          </thead>
          <tbody>
            {sucursales.length === 0 ? (
              <tr>
                <td colSpan={3} className="p-12 text-center text-[#757575] text-[14px]">No hay sucursales registradas.</td>
              </tr>
            ) : (
              sucursales.map((sucursal) => (
                <tr key={sucursal.id} className="border-b border-[#F5F5F5] hover:bg-[#FAFAFA] transition-colors">
                  <td className="p-4 text-[13px] font-medium text-[#212121]">{sucursal.id}</td>
                  <td className="p-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#FFEBEE] flex items-center justify-center">
                      <Store className="w-4 h-4 text-[#D32F2F]" />
                    </div>
                    <span className="text-[14px] font-medium text-[#212121]">{sucursal.nombre}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-[13px] text-[#757575]">
                      <MapPin className="w-4 h-4 opacity-50" />
                      {sucursal.direccion || 'Sin dirección registrada'}
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