import { Search, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  currentTitle?: string;
}

export default function Header({ currentTitle }: HeaderProps) {
  const { user } = useAuth();

  // Extraemos el mismo identificador para que coincida con el Sidebar
  const userIdentifier = user?.name || 'Usuario';
  const initial = userIdentifier.charAt(0).toUpperCase();

  return (
    <header className="h-16 bg-white border-b border-[#E0E0E0] flex items-center px-8 gap-8 shadow-sm">
      {/* Título de la vista actual */}
      <h2 className="text-[24px] font-semibold text-[#212121]">
        {currentTitle || 'SATSIWM'}
      </h2>

      {/* Buscador */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#757575]" />
          <input
            type="text"
            placeholder="Buscar tickets, tiendas..."
            className="w-full pl-10 pr-4 py-2 border border-[#E0E0E0] rounded-md text-[14px] focus:outline-none focus:border-[#D32F2F]"
          />
        </div>
      </div>

      {/* Sección Derecha */}
      <div className="flex items-center gap-4">
        {/* Notificaciones */}
        <button className="relative p-2 hover:bg-[#F5F5F5] rounded-full transition-colors">
          <Bell className="w-5 h-5 text-[#757575]" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-[#D32F2F] rounded-full"></span>
        </button>

        {/* Avatar Circular Dinámico */}
        <div
          className="w-8 h-8 rounded-full bg-[#D32F2F] flex items-center justify-center text-white text-[14px] font-medium cursor-help select-none"
          title={userIdentifier}
        >
          {initial}
        </div>
      </div>
    </header>
  );
}