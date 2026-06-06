import { useAuth } from '../context/AuthContext';
import { User, Mail, Shield, Bell, Key } from 'lucide-react';

export default function Settings() {
  const { user } = useAuth();

  // Función auxiliar para darle un formato amigable al rol que viene de Java
  const getRoleDisplay = (role?: string) => {
    switch (role) {
      case 'admin': return 'Jefe de TI (Administrador)';
      case 'technician': return 'Técnico de Soporte';
      case 'store': return 'Personal de Tienda / Caja';
      default: return 'Usuario SATSI';
    }
  };

  // Obtenemos el nombre de usuario o correo del token (usualmente viene en 'sub')
  const userIdentifier = (user as any)?.sub || (user as any)?.email || user?.id || 'Usuario';
  const initial = userIdentifier.charAt(0).toUpperCase();

  return (
    <div className="p-8 max-w-[800px]">
      <div className="mb-6">
        <h2 className="text-[24px] font-semibold text-[#212121] mb-2">
          Configuración de Cuenta
        </h2>
        <p className="text-[14px] text-[#757575]">
          Gestiona tu información personal y preferencias del sistema.
        </p>
      </div>

      <div className="space-y-6">
        {/* Sección: Perfil del Usuario */}
        <div className="bg-white rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-6">
          <h3 className="text-[18px] font-semibold text-[#212121] mb-6 flex items-center gap-2">
            <User className="w-5 h-5 text-[#D32F2F]" />
            Perfil del Usuario
          </h3>
          
          <div className="flex items-center gap-6 mb-8">
            <div className="w-20 h-20 rounded-full bg-[#FFEBEE] border-2 border-[#D32F2F] flex items-center justify-center text-[#D32F2F] text-[32px] font-bold">
              {initial}
            </div>
            <div>
              <h4 className="text-[20px] font-medium text-[#212121]">
                {userIdentifier}
              </h4>
              <span className="inline-block mt-1 px-3 py-1 bg-[#F5F5F5] text-[#757575] rounded-full text-[12px] font-medium">
                {getRoleDisplay(user?.role)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-[12px] font-medium text-[#757575] mb-1">Identificador de Acceso</label>
              <div className="flex items-center gap-3 px-4 py-3 border border-[#E0E0E0] rounded-md bg-[#F5F5F5] text-[14px] text-[#212121]">
                <Mail className="w-4 h-4 text-[#757575]" />
                <span>{userIdentifier}</span>
              </div>
            </div>
            <div>
              <label className="block text-[12px] font-medium text-[#757575] mb-1">Nivel de Permisos</label>
              <div className="flex items-center gap-3 px-4 py-3 border border-[#E0E0E0] rounded-md bg-[#F5F5F5] text-[14px] text-[#212121] capitalize">
                <Shield className="w-4 h-4 text-[#757575]" />
                <span>{user?.role || 'No asignado'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sección: Preferencias y Notificaciones */}
        <div className="bg-white rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-6">
          <h3 className="text-[18px] font-semibold text-[#212121] mb-6 flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#D32F2F]" />
            Preferencias del Sistema
          </h3>
          <div className="space-y-4">
            <label className="flex items-center justify-between p-4 border border-[#E0E0E0] rounded-md cursor-pointer hover:bg-[#FAFAFA] transition-colors">
              <div>
                <p className="text-[14px] font-medium text-[#212121]">Notificaciones por Correo</p>
                <p className="text-[12px] text-[#757575]">Recibir alertas sobre actualizaciones en mis tickets.</p>
              </div>
              <div className="relative inline-block w-10 align-middle select-none transition duration-200 ease-in">
                <input type="checkbox" name="toggle" id="toggle1" className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer checked:right-0 checked:border-[#D32F2F]" defaultChecked />
                <label htmlFor="toggle1" className="toggle-label block overflow-hidden h-5 rounded-full bg-[#E0E0E0] cursor-pointer"></label>
              </div>
            </label>
          </div>
        </div>

        {/* Sección: Seguridad */}
        <div className="bg-white rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-6">
          <h3 className="text-[18px] font-semibold text-[#212121] mb-4 flex items-center gap-2">
            <Key className="w-5 h-5 text-[#D32F2F]" />
            Seguridad
          </h3>
          <p className="text-[14px] text-[#757575] mb-4">
            Tu contraseña es gestionada centralmente por el servicio de identidad de Wong (IAM Service).
          </p>
          <button className="px-4 py-2 bg-white border border-[#D32F2F] text-[#D32F2F] rounded-md text-[14px] font-medium hover:bg-[#FFEBEE] transition-all">
            Solicitar Cambio de Contraseña
          </button>
        </div>
      </div>
    </div>
  );
}