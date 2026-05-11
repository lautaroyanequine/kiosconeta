// ════════════════════════════════════════════════════════════════════════════
// API: Turnos, Gastos y Empleados
// ════════════════════════════════════════════════════════════════════════════

import apiClient, { handleResponse, handleError } from './client';
import { API_ENDPOINTS } from '../utils/constants';
import type {
  Gasto,
  CreateGastoDTO,
  TipoDeGasto,
  Empleado,
  CreateEmpleadoDTO,
  UpdateEmpleadoDTO,
  EmpleadoConPermisos,
  AsignarPermisosDTO,
  Permiso,
  PlantillaRol,
} from '../types';


// ────────────────────────────────────────────────────────────────────────────
// GASTOS API
// ────────────────────────────────────────────────────────────────────────────

export const gastosApi = {
  /**
   * Obtener todos los gastos
   */
  getAll: async (filtros?: {
    fechaDesde?: string;
    fechaHasta?: string;
    tipoGastoId?: number;
  }): Promise<Gasto[]> => {
    try {
      const response = await apiClient.get<Gasto[]>(API_ENDPOINTS.GASTOS, {
        params: filtros,
      });
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Obtener gasto por ID
   */
  getById: async (id: number): Promise<Gasto> => {
    try {
      const response = await apiClient.get<Gasto>(
        API_ENDPOINTS.GASTOS_BY_ID(id)
      );
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Crear gasto
   */
  create: async (data: CreateGastoDTO): Promise<Gasto> => {
    try {
      const response = await apiClient.post<Gasto>(API_ENDPOINTS.GASTOS, data);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Actualizar gasto
   */
  update: async (id: number, data: Partial<Gasto>): Promise<Gasto> => {
    try {
      const response = await apiClient.put<Gasto>(
        API_ENDPOINTS.GASTOS_BY_ID(id),
        data
      );
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Eliminar gasto
   */
  delete: async (id: number): Promise<void> => {
    try {
      await apiClient.delete(API_ENDPOINTS.GASTOS_BY_ID(id));
    } catch (error) {
      return handleError(error);
    }
  },
};

// ────────────────────────────────────────────────────────────────────────────
// TIPOS DE GASTO API
// ────────────────────────────────────────────────────────────────────────────

export const tiposGastoApi = {
  /**
   * Obtener todos los tipos de gasto
   */
  getAll: async (): Promise<TipoDeGasto[]> => {
    try {
      const response = await apiClient.get<TipoDeGasto[]>(
        API_ENDPOINTS.TIPOS_GASTO
      );
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Crear tipo de gasto
   */
  create: async (data: {
    nombre: string;
    descripcion?: string;
    kioscoId: number;
  }): Promise<TipoDeGasto> => {
    try {
      const response = await apiClient.post<TipoDeGasto>(
        API_ENDPOINTS.TIPOS_GASTO,
        data
      );
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },
};

// ────────────────────────────────────────────────────────────────────────────
// EMPLEADOS API
// ────────────────────────────────────────────────────────────────────────────

export const empleadosApi = {
  /**
   * Obtener todos los empleados
   */
  getByKiosco: async (kioscoId: number) => {
  try {
    const response = await apiClient.get(`/Empleados/kiosco/${kioscoId}`)
    return handleResponse(response)
  } catch (error) {
    return handleError(error)
  }
},
  getAll: async (): Promise<Empleado[]> => {
    try {
      const response = await apiClient.get<Empleado[]>(API_ENDPOINTS.EMPLEADOS);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Obtener empleados activos
   */
  getActivos: async (): Promise<Empleado[]> => {
    try {
      const response = await apiClient.get<Empleado[]>(
        API_ENDPOINTS.EMPLEADOS_ACTIVOS
      );
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Obtener empleado por ID
   */
  getById: async (id: number): Promise<Empleado> => {
    try {
      const response = await apiClient.get<Empleado>(
        API_ENDPOINTS.EMPLEADOS_BY_ID(id)
      );
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Crear empleado
   */
  create: async (data: CreateEmpleadoDTO): Promise<Empleado> => {
    try {
      const response = await apiClient.post<Empleado>(
        API_ENDPOINTS.EMPLEADOS,
        data
      );
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Actualizar empleado
   */
  update: async (id: number, data: UpdateEmpleadoDTO): Promise<Empleado> => {
    try {
      const response = await apiClient.put<Empleado>(
        API_ENDPOINTS.EMPLEADOS_BY_ID(id),
        data
      );
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Eliminar empleado
   */
  delete: async (id: number): Promise<void> => {
    try {
      await apiClient.delete(API_ENDPOINTS.EMPLEADOS_BY_ID(id));
    } catch (error) {
      return handleError(error);
    }
  },
};

// ────────────────────────────────────────────────────────────────────────────
// PERMISOS API
// ────────────────────────────────────────────────────────────────────────────

export const permisosApi = {
  /**
   * Obtener todos los permisos disponibles
   */
  getAll: async (): Promise<Permiso[]> => {
    try {
      const response = await apiClient.get<Permiso[]>(API_ENDPOINTS.PERMISOS);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Obtener permisos de un empleado
   */
  getByEmpleado: async (empleadoId: number): Promise<EmpleadoConPermisos> => {
    try {
      const response = await apiClient.get<EmpleadoConPermisos>(
        API_ENDPOINTS.PERMISOS_EMPLEADO(empleadoId)
      );
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Asignar permisos a un empleado
   */
  asignar: async (data: AsignarPermisosDTO): Promise<void> => {
    try {
      await apiClient.post(API_ENDPOINTS.PERMISOS_ASIGNAR, data);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Quitar permisos de un empleado
   */
  quitar: async (data: AsignarPermisosDTO): Promise<void> => {
    try {
      await apiClient.post(`${API_ENDPOINTS.PERMISOS}/quitar`, data);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Reemplazar todos los permisos de un empleado
   */
  reemplazar: async (data: AsignarPermisosDTO): Promise<void> => {
    try {
      // Backend espera PermisosIds con mayúscula
      await apiClient.put(`${API_ENDPOINTS.PERMISOS}/reemplazar`, {
        EmpleadoId: data.empleadoId,
        PermisosIds: data.permisosIds,
      });
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Obtener plantillas de roles
   */
  getPlantillas: async (): Promise<PlantillaRol[]> => {
    try {
      const response = await apiClient.get<PlantillaRol[]>(
        API_ENDPOINTS.PERMISOS_PLANTILLAS
      );
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Asignar rol completo a un empleado
   */
  asignarRol: async (empleadoId: number, rol: string): Promise<void> => {
    try {
      await apiClient.post(
        `${API_ENDPOINTS.PERMISOS_ASIGNAR_ROL}?empleadoId=${empleadoId}&rol=${rol}`
      );
    } catch (error) {
      return handleError(error);
    }
  },
};