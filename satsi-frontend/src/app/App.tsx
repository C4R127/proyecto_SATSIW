import type { ReactNode } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import CreateTicket from './components/CreateTicket';
import KanbanBoard from './components/KanbanBoard';
import TicketDetail from './components/TicketDetail';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import Settings from './components/Settings';
import AppLayout from './layouts/AppLayout';
import { useAuth } from './context/AuthContext';
import type { UserRole } from './types';
import TicketList from './components/TicketList';

import Inventory from './components/Inventory';
import SlaMonitor from './components/SlaMonitor';

import SucursalesAdmin from './components/SucursalesAdmin';
import UserManagement from './components/UserManagement';


function RequireAuth({
  children,
  allowedRoles,
}: {
  children: ReactNode;
  allowedRoles?: UserRole[];
}) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 👇 VAMOS A COMENTAR ESTO TEMPORALMENTE PARA ROMPER EL BUCLE 👇
  /*
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  */

  return <>{children}</>;
}

function HomeRedirect() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'manager') {
    return <Navigate to="/analytics" replace />;
  }

  if (user.role === 'sysadmin') {
    return <Navigate to="/inventory" replace />;
  }

  if (user.role === 'technician') {
    return <Navigate to="/kanban" replace />;
  }

  // Por defecto (Personal de Tienda)
  return <Navigate to="/tickets" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }
      >
        <Route index element={<HomeRedirect />} />
        <Route
          path="dashboard"
          element={
            <RequireAuth allowedRoles={['technician', 'manager', 'sysadmin']}>
              <Dashboard />
            </RequireAuth>
          }
        />
        <Route
          path="tickets"
          element={
            <RequireAuth allowedRoles={['store', 'technician', 'manager', 'sysadmin']}>
              <TicketList />
            </RequireAuth>
          }
        />

        <Route
          path="tickets/new"
          element={
            <RequireAuth allowedRoles={['store', 'technician']}>
              <CreateTicket />
            </RequireAuth>
          }
        />
        <Route
          path="kanban"
          element={
            <RequireAuth allowedRoles={['technician', 'manager', 'sysadmin']}>
              <KanbanBoard />
            </RequireAuth>
          }
        />
        <Route
          path="tickets/:ticketId"
          element={
            <RequireAuth allowedRoles={['store', 'technician', 'manager', 'sysadmin']}>
              <TicketDetail />
            </RequireAuth>
          }
        />
        <Route
          path="analytics"
          element={
            <RequireAuth allowedRoles={['manager']}>
              <AnalyticsDashboard />
            </RequireAuth>
          }
        />
        <Route 
          path="inventory" 
          element={
            <RequireAuth allowedRoles={['sysadmin']}>
              <Inventory />
            </RequireAuth>
          } 
        />
        <Route path="/stores" element={<SucursalesAdmin />} />
        <Route path="/users" element={<UserManagement />} />
        <Route 
          path="sla" 
          element={
            <RequireAuth allowedRoles={['technician']}>
              <SlaMonitor />
            </RequireAuth>
          } 
        />
        <Route
          path="settings"
          element={
            <RequireAuth allowedRoles={['store', 'technician', 'manager', 'sysadmin']}>
              <Settings />
            </RequireAuth>
          }
        />
      </Route>
          
      

    </Routes>
  );
}
