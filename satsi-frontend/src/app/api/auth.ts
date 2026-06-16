import { apiFetch } from './client';
import type { AuthUser, UserRole } from '../types'; 

export interface LoginPayload {
    email?: string; 
    username?: string;
    password: string;
    roleHint?: UserRole;
}

// Esta función se encarga de enviar las credenciales al backend para obtener un token de autenticación
export function login(payload: LoginPayload) {
    const backendPayload = {
        // Usamos el email del formulario como username para Java
        username: payload.email || payload.username, 
        password: payload.password
    };

    // Apuntamos a la ruta exacta de tu Gateway
    return apiFetch<string>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(backendPayload),
    });
}