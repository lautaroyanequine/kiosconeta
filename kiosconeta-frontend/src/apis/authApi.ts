// ════════════════════════════════════════════════════════════════════════════
// API: Auth (Autenticación)
// ════════════════════════════════════════════════════════════════════════════

import apiClient, { handleResponse, handleError } from './client';
import { API_ENDPOINTS } from '../utils/constants';
import type {
  LoginAdminDTO,
  LoginEmpleadoDTO,
  AuthResponse,
  EmpleadoLoginDTO,
  CambiarPasswordDTO,
  CambiarPinDTO,
} from '../types';

// ────────────────────────────────────────────────────────────────────────────
// AUTH API
// ────────────────────────────────────────────────────────────────────────────

export const authApi = {
  /**
   * Login del administrador con email y password
   */
  loginAdmin: async (data: LoginAdminDTO): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post<AuthResponse>(
        API_ENDPOINTS.LOGIN_ADMIN,
        data
      );
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Login de empleado con ID/legajo y PIN
   */
  loginEmpleado: async (data: LoginEmpleadoDTO): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post<AuthResponse>(
        API_ENDPOINTS.LOGIN_EMPLEADO,
        data
      );
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Obtener lista de empleados disponibles para login
   */
  getEmpleadosParaLogin: async (kioscoId: number): Promise<EmpleadoLoginDTO[]> => {
    try {
      const response = await apiClient.get<EmpleadoLoginDTO[]>(
        `${API_ENDPOINTS.EMPLEADOS_LOGIN}/${kioscoId}`
      );
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Registrar nuevo kiosco con administrador
   */
  register: async (data: {
    nombreKiosco: string;
    direccionKiosco?: string;
    nombreAdmin: string;
    email: string;
    password: string;
  }): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post<AuthResponse>(
        API_ENDPOINTS.REGISTER,
        data
      );
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Cambiar contraseña del administrador
   */
  cambiarPassword: async (data: CambiarPasswordDTO): Promise<void> => {
    try {
      await apiClient.post(API_ENDPOINTS.CAMBIAR_PASSWORD, data);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Cambiar PIN de un empleado (el propio empleado)
   */
  cambiarPin: async (data: CambiarPinDTO): Promise<void> => {
    try {
      await apiClient.post(API_ENDPOINTS.CAMBIAR_PIN, data);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Asignar/resetear PIN de un empleado (solo admin)
   */
  asignarPin: async (empleadoId: number, pin: string): Promise<void> => {
    try {
      await apiClient.post(
        `${API_ENDPOINTS.ASIGNAR_PIN}?empleadoId=${empleadoId}&pin=${pin}`
      );
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Verificar si el token es válido
   */
  verificarToken: async (): Promise<{
    valido: boolean;
    empleadoId: number;
    nombre: string;
    esAdmin: boolean;
  }> => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.VERIFICAR_TOKEN);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },
};