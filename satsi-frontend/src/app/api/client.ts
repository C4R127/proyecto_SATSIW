const BASE_URL = 'http://localhost:8080'; // La dirección de API Gateway


//
export async function apiFetch<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
    // 1. Intentamos obtener el token guardado (generalmente se guarda al hacer login)
    const token = localStorage.getItem('jwt_token');

    // 2. Preparamos las cabeceras base
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...((init?.headers as Record<string, string>) || {}),
    };

    // 3. ¡La Magia! Si el token existe, se lo inyectamos a la petición
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    // 4. Construimos la URL real uniendo la base con la ruta
    const url = typeof input === 'string' && input.startsWith('/') 
        ? `${BASE_URL}${input}` 
        : input;

    const response = await fetch(url, {
        ...init,
        headers,
    });

    if (!response.ok) {
        const message = await response.text();
        throw new Error(message || 'Error de red');
    }

    // Si la respuesta es vacía o es solo un string (como tu token), evitamos el error del .json()
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
        return response.json() as Promise<T>;
    } else {
        return response.text() as unknown as Promise<T>;
    }
}