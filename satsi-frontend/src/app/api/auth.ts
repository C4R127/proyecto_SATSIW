import { apiFetch } from './client';
import type { AuthUser, UserRole } from '../types'; // Asegúrate de que esta ruta sea la correcta

export interface LoginPayload {
    email?: string; // O el nombre que uses en tu formulario
    username?: string;
    password: string;
    roleHint?: UserRole;
}

export function login(payload: LoginPayload) {
    // Traducimos el formato de React al formato que espera Java
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