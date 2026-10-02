import { CONFIG } from 'src/config-global';

const API_URL = `${CONFIG.apiBase}/manejoJWT/api`;

// ============================================================
// HELPER FUNCTIONS
// ============================================================

// Función para limpiar URLs de imágenes (quitar puerto si existe)
const cleanImageUrl = (url: string | undefined): string | undefined => {
  if (!url) return url;

  try {
    // Si es una URL absoluta con protocolo
    if (url.startsWith('http://') || url.startsWith('https://')) {
      const urlObj = new URL(url);
      // Retornar solo el pathname (ruta relativa sin host ni puerto)
      return urlObj.pathname;
    }
    // Si ya es una ruta relativa, devolverla tal cual
    return url;
  } catch {
    // Si hay error parseando la URL, devolverla tal cual
    return url;
  }
};

// ============================================================
// TIPOS
// ============================================================

interface Usuario {
  id: string;
  nombre: string;
  tipo: string;
  imagen?: string;
  email?: string;
}

export type TipoUsuario = 'ADMINISTRADOR' | 'CLIENTE' | 'AUDITOR';

export interface JsonInformacion {
  idUsuario: string;
  tipoUsuario: TipoUsuario;  // Campo correcto del backend
  estatus: string;
  sesion: string;
  [key: string]: unknown;
}

// ============================================================
// FUNCIONES DE JSON_INFORMACION (base64)
// ============================================================

export const getJsonInformacion = (): JsonInformacion | null => {
  try {
    const base64Data = localStorage.getItem('JSON_INFORMACION');
    if (!base64Data) return null;

    const jsonString = atob(base64Data);
    return JSON.parse(jsonString) as JsonInformacion;
  } catch (error) {
    console.error('Error decoding JSON_INFORMACION:', error);
    return null;
  }
};

export const getTipoUsuario = (): TipoUsuario | null => {
  const info = getJsonInformacion();
  if (!info?.tipoUsuario) return null;

  const tipoUpper = info.tipoUsuario.toUpperCase() as TipoUsuario;
  if (tipoUpper === 'ADMINISTRADOR' || tipoUpper === 'CLIENTE' || tipoUpper === 'AUDITOR') {
    return tipoUpper;
  }
  return null;
};

export const getEstatus = (): string | null => {
  const info = getJsonInformacion();
  return info?.estatus || null;
};

export const isAdmin = (): boolean => {
  const tipo = getTipoUsuario();
  return tipo === 'ADMINISTRADOR';
};

export const hasValidRole = (): boolean => {
  const tipo = getTipoUsuario();
  return tipo === 'ADMINISTRADOR' || tipo === 'CLIENTE' || tipo === 'AUDITOR';
};

export const getAccessToken = (): string | null => localStorage.getItem('accessToken');
export const getRefreshToken = (): string | null => localStorage.getItem('refreshToken');

export const getUsuario = (): Usuario | null => {
  const usuario = localStorage.getItem('usuario');
  if (!usuario) return null;

  const parsed = JSON.parse(usuario);
  // Limpiar la URL de la imagen para quitar el puerto si existe
  if (parsed.imagen) {
    parsed.imagen = cleanImageUrl(parsed.imagen);
  }
  return parsed;
};

export const isAuthenticated = (): boolean => {
  const token = getAccessToken();
  return !!token;
};

export const logout = async (): Promise<void> => {
  try {
    const token = getAccessToken();
    
    if (token) {
      await fetch(`${API_URL}/logout.controller.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
    }
  } catch (error) {
    console.error('Error en logout:', error);
  } finally {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('usuario');
    localStorage.removeItem('JSON_INFORMACION');
  }
};

export const refreshAccessToken = async (): Promise<string | null> => {
  try {
    const refreshToken = getRefreshToken();
    
    if (!refreshToken) {
      throw new Error('No refresh token');
    }
    
    const response = await fetch(`${API_URL}/refresh.controller.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken })
    });
    
    const data = await response.json();
    
    if (data.message === 'Good') {
      localStorage.setItem('accessToken', data.accessToken);
      return data.accessToken;
    } else {
      await logout();
      return null;
    }
  } catch (error) {
    console.error('Error refreshing token:', error);
    await logout();
    return null;
  }
};