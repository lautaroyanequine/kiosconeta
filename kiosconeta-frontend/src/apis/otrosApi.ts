// ════════════════════════════════════════════════════════════════════════════
// API: Turnos, Gastos y Empleados
// ════════════════════════════════════════════════════════════════════════════

import apiClient, { handleResponse, handleError } from './client';
import { API_ENDPOINTS } from '../utils/constants';
import type {
  Turno,
  AbrirTurnoDTO,
  CerrarTurnoDTO,
  CierreTurno,
  Gasto,
  CreateGastoDTO,
  TipoGasto,
  Empleado,
  CreateEmpleadoDTO,
  UpdateEmpleadoDTO,
  EmpleadoConPermisos,
  AsignarPermisosDTO,
  Permiso,
  PlantillaRol,
} from '../types';

// ────────────────────────────────────────────────────────────────────────────
// TURNOS API
// ────────────────────────────────────────────────────────────────────────────

export const turnosApi = {
  /**
   * Obtener todos los turnos
   */
  getAll: async (): Promise<Turno[]> => {
    try {
      const response = await apiClient.get<Turno[]>(API_ENDPOINTS.TURNOS);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Obtener turno actual
   */
  getActual: async (): Promise<Turno | null> => {
    try {
      const response = await apiClient.get<Turno>(API_ENDPOINTS.TURNO_ACTUAL);
      return handleResponse(response);
    } catch (error: any) {
      if (error.statusCode === 404) return null;
      return handleError(error);
    }
  },

  /**
   * Abrir turno
   */
  abrir: async (data: AbrirTurnoDTO): Promise<Turno> => {
    try {
      const response = await apiClient.post<Turno>(
        API_ENDPOINTS.TURNO_ABRIR,
        data
      );
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Cerrar turno
   */
  cerrar: async (turnoId: number, data: CerrarTurnoDTO): Promise<CierreTurno> => {
    try {
      const response = await apiClient.post<CierreTurno>(
        API_ENDPOINTS.TURNO_CERRAR(turnoId),
        data
      );
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Obtener detalle de cierre de turno
   */
  getDetalle: async (turnoId: number): Promise<CierreTurno> => {
    try {
      const response = await apiClient.get<CierreTurno>(
        API_ENDPOINTS.TURNO_DETALLE(turnoId)
      );
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },
};

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
  getAll: async (): Promise<TipoGasto[]> => {
    try {
      const response = await apiClient.get<TipoGasto[]>(
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
  }): Promise<TipoGasto> => {
    try {
      const response = await apiClient.post<TipoGasto>(
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
      await apiClient.put(`${API_ENDPOINTS.PERMISOS}/reemplazar`, data);
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