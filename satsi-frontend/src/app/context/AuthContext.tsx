import { createContext, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { AuthUser, UserRole } from '../types';
import { login as loginRequest } from '../api/auth';

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, roleHint?: UserRole) => Promise<AuthUser>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Función para decodificar el JWT y extraer su payload, que contiene la información real del usuario asignada por Java
function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  
  const [user, setUser] = useState<AuthUser | null>(() => {
    const token = localStorage.getItem('jwt_token');
    const savedRole = localStorage.getItem('user_role');
    const savedName = localStorage.getItem('user_name');

    if (token && savedRole && savedName) {
      return {
        id: '1', 
        name: savedName,
        role: savedRole as UserRole
      };
    }
    return null;
  });

  // Función para manejar el login, que ahora se encarga de guardar el token en localStorage y extraer la información real del usuario desde el JWT
  const login = async (email: string, password: string) => {
    const response: any = await loginRequest({ email, password });
    
    // 1. Guardamos el token encriptado que llega desde Java
    const tokenString = typeof response === 'string' ? response : response.token;
    localStorage.setItem('jwt_token', tokenString);

    // 2. Decodificamos el token para extraer el nombre de usuario real y el rol.
    const decodedToken = parseJwt(tokenString);
    
    // En JWT, el nombre de usuario siempre viaja en la propiedad "sub" (Subject)
    const realUsername = decodedToken?.sub || email.split('@')[0];
    
    // Extraemos el rol exacto que Java nos asignó
    const realRole = decodedToken?.role || decodedToken?.rol || 'store';

    const nextUser: AuthUser = {
        id: '1', 
        name: realUsername,
        role: realRole as UserRole
    };

    // 3. Se guarda el rol y el nombre real en localStorage para mantener la sesión.
    localStorage.setItem('user_role', realRole);
    localStorage.setItem('user_name', realUsername);

    setUser(nextUser);
    return nextUser;
  };

  const logout = () => {
    // 4. Se eliminan los datos de la sesión al hacer logout
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_name');
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      login,
      logout,
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
}