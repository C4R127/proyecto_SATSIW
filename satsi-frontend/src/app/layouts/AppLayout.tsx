import { Outlet, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

const routeTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/tickets/new': 'Mis Tickets',
  '/kanban': 'Tablero Kanban',
  '/tickets': 'Detalle de Ticket',
  '/analytics': 'Panel de Reportes',
  '/settings': 'Configuracion',
};

export default function AppLayout() {
  const location = useLocation();
  const title = Object.entries(routeTitles).find(([path]) =>
    location.pathname.startsWith(path)
  )?.[1];

  return (
    <div className="flex h-screen bg-[#F5F5F5]">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header currentTitle={title} />
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
