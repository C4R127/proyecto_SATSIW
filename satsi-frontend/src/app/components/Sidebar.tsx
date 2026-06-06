import { LayoutDashboard, Ticket, Columns, BarChart3, Settings, LogOut, Clock, Database, Store, Users } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // Menú estrictamente basado en el Diagrama de Casos de Uso UML
  const menuItems = [
    { path: '/tickets', label: 'Mis Tickets', icon: Ticket, roles: ['store'] }, // CU-03
    { path: '/kanban', label: 'Tablero Kanban', icon: Columns, roles: ['technician'] }, // CU-05
    { path: '/sla', label: 'Monitoreo SLA', icon: Clock, roles: ['technician'] }, // CU-06
    { path: '/analytics', label: 'Analítica Gerencial', icon: BarChart3, roles: ['manager'] }, // CU-07
    { path: '/inventory', label: 'Inventario de Activos', icon: Database, roles: ['sysadmin'] }, // CU-02
    { path: '/stores', label: 'Gestión de Sucursales', icon: Store, roles: ['sysadmin'] }, // CU-08
    { path: '/users', label: 'Gestión de Usuarios', icon: Users, roles: ['sysadmin'] }, // CU-09
    { path: '/settings', label: 'Configuración', icon: Settings, roles: ['store', 'technician', 'manager', 'sysadmin'] },
  ];

  const visibleItems = menuItems.filter((item) => item.roles.includes(user?.role || ''));

  const userIdentifier = user?.name || 'Usuario';
  const initial = userIdentifier.charAt(0).toUpperCase();

  const getRoleDisplay = (role?: string) => {
    switch (role) {
      case 'sysadmin': return 'Admin. de Sistema';
      case 'manager': return 'Gerencia de TI';
      case 'technician': return 'Técnico de Soporte';
      case 'store': return 'Personal de Tienda';
      default: return 'Personal SATSI';
    }
  };

  return (
    <div className="w-[240px] bg-white border-r border-[#E0E0E0] flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-[#E0E0E0]">
        <h2 className="text-[20px] font-bold text-[#D32F2F]">SATSIWM</h2>
        <p className="text-[10px] text-[#757575] mt-1">Wong IT Support</p>
      </div>

      {/* Navegación */}
      <nav className="flex-1 py-4">
        {visibleItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }: { isActive: boolean }) =>
                `w-full flex items-center gap-3 px-6 py-3 text-[14px] transition-all relative ${
                  isActive
                    ? 'bg-[#FFEBEE] text-[#D32F2F] font-medium'
                    : 'text-[#757575] hover:bg-[#F5F5F5]'
                }`
              }
            >
              {({ isActive }: { isActive: boolean }) => (
                <>
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#D32F2F]" />
                  )}
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Sección de Usuario Completamente Dinámica */}
      <div className="p-6 border-t border-[#E0E0E0]">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-[#D32F2F] flex items-center justify-center text-white font-medium shrink-0">
            {initial}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-[14px] font-medium text-[#212121] truncate" title={userIdentifier}>
              {userIdentifier}
            </p>
            <p className="text-[12px] text-[#757575]">
              {getRoleDisplay(user?.role)}
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            logout();
            navigate('/login');
          }}
          className="w-full flex items-center justify-center gap-2 py-2 text-[14px] text-[#757575] hover:text-[#D32F2F] transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );
}