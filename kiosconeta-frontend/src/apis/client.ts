// ════════════════════════════════════════════════════════════════════════════
// API CLIENT: Configuración de Axios
// ════════════════════════════════════════════════════════════════════════════

import axios from 'axios';
import type { AxiosError, AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';



import { API_BASE_URL, STORAGE_KEYS, MESSAGES } from '../utils/constants';
import { getStorage, removeStorage } from '../utils/helpers';

// ────────────────────────────────────────────────────────────────────────────
// CREAR INSTANCIA DE AXIOS
// ────────────────────────────────────────────────────────────────────────────

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 segundos
});

// ────────────────────────────────────────────────────────────────────────────
// INTERCEPTOR DE REQUEST (agregar token)
// ────────────────────────────────────────────────────────────────────────────

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Prioridad: token del empleado activo → token del kiosco (fallback)
    const tokenEmpleado = getStorage<string>(STORAGE_KEYS.TOKEN);
    const tokenKiosco   = getStorage<string>(STORAGE_KEYS.KIOSCO_TOKEN);
    const token = tokenEmpleado ?? tokenKiosco;

    // LOG TEMPORAL — borrar después de debuggear
    console.log('[AUTH]', config.url, {
      tokenEmpleado: tokenEmpleado ? tokenEmpleado.slice(-20) : null,
      tokenKiosco:   tokenKiosco   ? tokenKiosco.slice(-20)   : null,
      usando: tokenEmpleado ? 'EMPLEADO' : tokenKiosco ? 'KIOSCO' : 'NINGUNO',
    });

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// ────────────────────────────────────────────────────────────────────────────
// INTERCEPTOR DE RESPONSE (manejar errores)
// ────────────────────────────────────────────────────────────────────────────

apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Si la respuesta es exitosa, devolver solo los datos
    return response;
  },
  (error: AxiosError) => {
    // Manejar errores específicos
    
    if (!error.response) {
      // Error de red (sin respuesta del servidor)
      console.error('Network error:', error.message);
      return Promise.reject({
        message: MESSAGES.ERROR.NETWORK,
        statusCode: 0,
      });
    }
    
    const { status, data } = error.response;
    
    switch (status) {
      case 401:
        // Token del empleado expiró → volver a selección de empleado
console.error(
  '401 - token usado:',
  (getStorage(STORAGE_KEYS.TOKEN) as string)?.substring(0, 50)
);        console.error('401 - empleado activo:', getStorage(STORAGE_KEYS.EMPLEADO_ACTIVO));
        console.error('401 - url:', (error as any)?.config?.url);
        debugger;
        removeStorage(STORAGE_KEYS.TOKEN);
        removeStorage(STORAGE_KEYS.USER);
        removeStorage(STORAGE_KEYS.EMPLEADO_ACTIVO);

        // Si hay sesión de kiosco → ir a selección de empleado
        // Si no hay sesión de kiosco → ir a login
        const tieneKiosco = !!getStorage(STORAGE_KEYS.KIOSCO_TOKEN);
        const enLogin = window.location.pathname.includes('/login');
        const enSeleccion = window.location.pathname.includes('/seleccionar-empleado');
        if (!enLogin && !enSeleccion) {
          window.location.href = tieneKiosco ? '/seleccionar-empleado' : '/login';
        }
        
        return Promise.reject({
          message: MESSAGES.ERROR.SESSION_EXPIRED,
          statusCode: 401,
        });
      
      case 403:
        // Sin permisos
        console.error('Forbidden - No permissions');
        return Promise.reject({
          message: MESSAGES.ERROR.UNAUTHORIZED,
          statusCode: 403,
        });
      
      case 404:
        // No encontrado
        console.error('Not found');
        return Promise.reject({
          message: MESSAGES.ERROR.NOT_FOUND,
          statusCode: 404,
        });
      
      case 400:
      case 422:
        // Error de validación
        console.error('Validation error:', data);
        return Promise.reject({
          message: (data as any)?.message || MESSAGES.ERROR.VALIDATION,
          errors: (data as any)?.errors || {},
          statusCode: status,
        });
      
      case 500:
      case 502:
      case 503:
        // Error del servidor
        console.error('Server error:', status);
        return Promise.reject({
          message: MESSAGES.ERROR.GENERIC,
          statusCode: status,
        });
      
      default:
        // Otros errores
        console.error('API error:', status, data);
        return Promise.reject({
          message: (data as any)?.message || MESSAGES.ERROR.GENERIC,
          statusCode: status,
        });
    }
  }
);

// ────────────────────────────────────────────────────────────────────────────
// HELPER FUNCTIONS
// ────────────────────────────────────────────────────────────────────────────

/**
 * Maneja la respuesta de la API
 * @param response - Respuesta de axios
 * @returns Solo los datos
 */
export const handleResponse = <T>(response: AxiosResponse<T>): T => {
  return response.data;
};

/**
 * Maneja errores de la API
 * @param error - Error capturado
 * @throws Error formateado
 */
export const handleError = (error: any): never => {
  if (error.message) {
    throw error;
  }
  throw {
    message: MESSAGES.ERROR.GENERIC,
    statusCode: 500,
  };
};

// ────────────────────────────────────────────────────────────────────────────
// EXPORT
// ────────────────────────────────────────────────────────────────────────────

export default apiClient;