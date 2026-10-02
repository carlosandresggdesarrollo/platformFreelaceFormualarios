/**
 * Servicio centralizado de API con logging en consola
 * Todas las respuestas del servidor se muestran en la consola del navegador
 */

import { CONFIG } from 'src/config-global';

// Colores para la consola
const CONSOLE_STYLES = {
  request: 'background: #2196F3; color: white; padding: 2px 6px; border-radius: 3px;',
  success: 'background: #4CAF50; color: white; padding: 2px 6px; border-radius: 3px;',
  error: 'background: #f44336; color: white; padding: 2px 6px; border-radius: 3px;',
  info: 'background: #9C27B0; color: white; padding: 2px 6px; border-radius: 3px;',
};

interface ApiResponse<T = unknown> {
  success?: boolean;
  message?: string;
  data?: T;
  [key: string]: unknown;
}

interface FetchOptions extends RequestInit {
  timeout?: number;
}

/**
 * Logger de API - muestra información detallada en la consola
 */
const apiLogger = {
  request: (method: string, url: string, body?: unknown) => {
    console.groupCollapsed(`%c API REQUEST %c ${method} ${url}`, CONSOLE_STYLES.request, '');
    console.log('URL:', url);
    console.log('Method:', method);
    if (body) {
      if (body instanceof FormData) {
        console.log('Body (FormData):');
        const formDataObj: Record<string, unknown> = {};
        body.forEach((value, key) => {
          formDataObj[key] = value;
        });
        console.table(formDataObj);
      } else {
        console.log('Body:', body);
      }
    }
    console.log('Timestamp:', new Date().toISOString());
    console.groupEnd();
  },

  response: (method: string, url: string, data: unknown, duration: number) => {
    console.groupCollapsed(`%c API RESPONSE %c ${method} ${url} (${duration}ms)`, CONSOLE_STYLES.success, '');
    console.log('URL:', url);
    console.log('Duration:', `${duration}ms`);
    console.log('Response Data:', data);
    if (typeof data === 'object' && data !== null) {
      console.table(data);
    }
    console.groupEnd();
  },

  error: (method: string, url: string, error: unknown, duration: number) => {
    console.groupCollapsed(`%c API ERROR %c ${method} ${url} (${duration}ms)`, CONSOLE_STYLES.error, '');
    console.log('URL:', url);
    console.log('Duration:', `${duration}ms`);
    console.error('Error:', error);
    console.groupEnd();
  },
};

/**
 * Función principal de fetch con logging automático
 */
export async function apiFetch<T = ApiResponse>(
  url: string,
  options: FetchOptions = {}
): Promise<T> {
  const startTime = performance.now();
  const method = options.method || 'GET';
  const fullUrl = url.startsWith('http') ? url : `${CONFIG.apiUrl}${url}`;

  // Log de la solicitud
  apiLogger.request(method, fullUrl, options.body);

  try {
    const response = await fetch(fullUrl, {
      ...options,
      credentials: options.credentials || 'include',
    });

    const data = await response.json();
    const duration = Math.round(performance.now() - startTime);

    // Log de la respuesta
    apiLogger.response(method, fullUrl, data, duration);

    return data as T;
  } catch (error) {
    const duration = Math.round(performance.now() - startTime);
    apiLogger.error(method, fullUrl, error, duration);
    throw error;
  }
}

/**
 * GET request con logging
 */
export async function apiGet<T = ApiResponse>(
  url: string,
  params?: Record<string, string | number | boolean>
): Promise<T> {
  let fullUrl = url;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      fullUrl += (url.includes('?') ? '&' : '?') + queryString;
    }
  }

  return apiFetch<T>(fullUrl, { method: 'GET' });
}

/**
 * POST request con FormData y logging
 */
export async function apiPost<T = ApiResponse>(
  url: string,
  data: Record<string, unknown> | FormData
): Promise<T> {
  let body: FormData;

  if (data instanceof FormData) {
    body = data;
  } else {
    body = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (value instanceof File) {
          body.append(key, value);
        } else if (typeof value === 'object') {
          body.append(key, JSON.stringify(value));
        } else {
          body.append(key, String(value));
        }
      }
    });
  }

  return apiFetch<T>(url, {
    method: 'POST',
    body,
  });
}

/**
 * PUT request con logging
 */
export async function apiPut<T = ApiResponse>(
  url: string,
  data: Record<string, unknown> | FormData
): Promise<T> {
  let body: FormData;

  if (data instanceof FormData) {
    body = data;
  } else {
    body = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        body.append(key, String(value));
      }
    });
  }

  return apiFetch<T>(url, {
    method: 'PUT',
    body,
  });
}

/**
 * DELETE request con logging
 */
export async function apiDelete<T = ApiResponse>(url: string): Promise<T> {
  return apiFetch<T>(url, { method: 'DELETE' });
}

/**
 * Helper para construir URLs de la API
 */
export function buildApiUrl(path: string, params?: Record<string, string | number | boolean>): string {
  let url = path.startsWith('http') ? path : `${CONFIG.apiUrl}${path}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
  }

  return url;
}

export default {
  fetch: apiFetch,
  get: apiGet,
  post: apiPost,
  put: apiPut,
  delete: apiDelete,
  buildUrl: buildApiUrl,
};
