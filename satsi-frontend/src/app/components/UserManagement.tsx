import React, { useState, useEffect } from 'react';
import { Users, Shield, Mail, Plus, X, Key } from 'lucide-react';
import { apiFetch } from '../api/client';

export interface Usuario {
  id: number;
  username: string;
  email: string;
  activo: boolean;
  rol: {
    nombre: string;
  };
}

export default function UserManagement() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Estados para el Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    password: '',
    nombreRol: 'store' // Valor por defecto
  });

  const fetchUsuarios = async () => {
    try {
      // Ajusta el puerto 8081 si tu iam-service corre en uno distinto
      const data = await apiFetch<Usuario[]>('http://localhost:8081/api/usuarios');
      setUsuarios(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error cargando usuarios:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const handleCrearUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await apiFetch('http://localhost:8081/api/usuarios', {
        method: 'POST',
        body: JSON.stringify(newUser)
      });

      setIsModalOpen(false);
      setNewUser({ username: '', email: '', password: '', nombreRol: 'store' });
      fetchUsuarios(); 
    } catch (error) {
      console.error("Error al crear usuario:", error);
      alert("Hubo un error al crear el usuario. Revisa la consola.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRoleBadge = (rol: string) => {
    switch (rol) {
      case 'sysadmin': return <span className="px-3 py-1 bg-[#424242] text-white rounded-full text-[12px] font-medium">SysAdmin</span>;
      case 'manager': return <span className="px-3 py-1 bg-[#1565C0] text-white rounded-full text-[12px] font-medium">Gerente IT</span>;
      case 'technician': return <span className="px-3 py-1 bg-[#F57F17] text-white rounded-full text-[12px] font-medium">Técnico</span>;
      case 'store': return <span className="px-3 py-1 bg-[#2E7D32] text-white rounded-full text-[12px] font-medium">Tienda</span>;
      default: return <span className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-[12px] font-medium">{rol}</span>;
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-[#757575]">Cargando personal del sistema...</div>;
  }

  return (
    <div className="p-8 space-y-8">
      {/* Cabecera */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-[24px] font-bold text-[#212121] mb-2">Gestión de Accesos e Identidad</h1>
          <p className="text-[14px] text-[#757575]">Administración centralizada de cuentas de empleados</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#D32F2F] text-white rounded-md text-[14px] font-medium hover:bg-[#B71C1C] transition-colors"
        >
          <Plus className="w-4 h-4" /> Nuevo Empleado
        </button>
      </div>

      {/* Tabla de Usuarios */}
      <div className="bg-white rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.08)] overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F5F5F5] border-b border-[#E0E0E0] text-[13px] text-[#757575]">
              <th className="p-4 font-medium">Usuario</th>
              <th className="p-4 font-medium">Correo Corporativo</th>
              <th className="p-4 font-medium">Nivel de Acceso (Rol)</th>
              <th className="p-4 font-medium">Estado</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-12 text-center text-[#757575] text-[14px]">No hay usuarios registrados.</td>
              </tr>
            ) : (
              usuarios.map((usuario) => (
                <tr key={usuario.id} className="border-b border-[#F5F5F5] hover:bg-[#FAFAFA] transition-colors">
                  <td className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#FFEBEE] text-[#D32F2F] flex items-center justify-center font-bold">
                      {usuario.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-[14px] font-medium text-[#212121]">{usuario.username}</p>
                      <p className="text-[12px] text-[#757575]">ID: {usuario.id}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-[13px] text-[#212121]">
                      <Mail className="w-4 h-4 text-[#757575]" />
                      {usuario.email}
                    </div>
                  </td>
                  <td className="p-4">{getRoleBadge(usuario.rol?.nombre)}</td>
                  <td className="p-4">
                    {usuario.activo ? (
                      <span className="text-[#2E7D32] font-medium text-[13px] flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-[#2E7D32]"></span> Activo
                      </span>
                    ) : (
                      <span className="text-[#C62828] font-medium text-[13px] flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-[#C62828]"></span> Suspendido
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de Nuevo Usuario */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-[18px] font-bold text-[#212121]">Crear Nueva Cuenta</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-[#757575] hover:text-[#212121]">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCrearUsuario} className="space-y-4">
              <div>
                <label className="block text-[12px] font-medium text-[#757575] mb-1">Nombre de Usuario</label>
                <div className="flex items-center gap-2 border border-[#E0E0E0] rounded px-3 py-2 focus-within:border-[#D32F2F]">
                  <Users className="w-4 h-4 text-[#757575]" />
                  <input 
                    type="text" 
                    required 
                    value={newUser.username} 
                    onChange={(e) => setNewUser({...newUser, username: e.target.value})} 
                    className="w-full text-[14px] focus:outline-none" 
                    placeholder="Ej: jcarlos" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[#757575] mb-1">Correo Electrónico</label>
                <div className="flex items-center gap-2 border border-[#E0E0E0] rounded px-3 py-2 focus-within:border-[#D32F2F]">
                  <Mail className="w-4 h-4 text-[#757575]" />
                  <input 
                    type="email" 
                    required 
                    value={newUser.email} 
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})} 
                    className="w-full text-[14px] focus:outline-none" 
                    placeholder="Ej: jcarlos@wong.com.pe" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[#757575] mb-1">Contraseña Temporal</label>
                <div className="flex items-center gap-2 border border-[#E0E0E0] rounded px-3 py-2 focus-within:border-[#D32F2F]">
                  <Key className="w-4 h-4 text-[#757575]" />
                  <input 
                    type="password" 
                    required 
                    value={newUser.password} 
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})} 
                    className="w-full text-[14px] focus:outline-none" 
                    placeholder="••••••••" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-medium text-[#757575] mb-1">Rol del Sistema</label>
                <div className="flex items-center gap-2 border border-[#E0E0E0] rounded px-3 py-2 focus-within:border-[#D32F2F]">
                  <Shield className="w-4 h-4 text-[#757575]" />
                  <select 
                    value={newUser.nombreRol}
                    onChange={(e) => setNewUser({...newUser, nombreRol: e.target.value})}
                    className="w-full text-[14px] focus:outline-none bg-white cursor-pointer"
                  >
                    <option value="store">Personal de Tienda (Cajero)</option>
                    <option value="technician">Técnico de Soporte</option>
                    <option value="manager">Gerente de TI</option>
                    <option value="sysadmin">Administrador de Sistemas</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-[#E0E0E0]">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2 text-[#757575] hover:bg-[#F5F5F5] rounded text-[14px] font-medium transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={isSubmitting} className="flex-1 py-2 bg-[#D32F2F] text-white rounded text-[14px] font-medium hover:bg-[#B71C1C] transition-colors disabled:opacity-50">
                  {isSubmitting ? 'Registrando...' : 'Registrar Empleado'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}