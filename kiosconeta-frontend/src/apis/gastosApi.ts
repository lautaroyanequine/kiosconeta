import apiClient, { handleResponse, handleError } from './client';
import type { GastoResponse, CreateGastoDTO, TipoDeGasto } from '../types/gastoTurno';

// ────────────────────────────────────────────────────────────────────────────
// GASTOS API
// ────────────────────────────────────────────────────────────────────────────

export const gastosApi = {

  //Todos los gastos
  getAll : async (): Promise<GastoResponse[]> => {
    try{
      const response = await apiClient.get<GastoResponse[]>(`/Gastos/turno/`);
      return handleResponse(response);
    }catch (error) {
      return handleError(error);
    }

  },
  // Gastos del turno actual
  getByTurno: async (cierreTurnoId: number): Promise<GastoResponse[]> => {
    try {
      const response = await apiClient.get<GastoResponse[]>(
        `/Gastos/turno/${cierreTurnoId}`
      );
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // Todos los gastos del kiosco (para el admin)
  getByKiosco: async (kioscoId: number): Promise<GastoResponse[]> => {
    try {
      const response = await apiClient.get<GastoResponse[]>(
        `/Gastos/kiosco/${kioscoId}`
      );
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // Crear gasto
  create: async (data: CreateGastoDTO): Promise<GastoResponse> => {
    try {
      const response = await apiClient.post<GastoResponse>('/Gastos', data);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // Eliminar gasto
  delete: async (id: number): Promise<void> => {
    try {
      const response = await apiClient.delete(`/Gastos/${id}`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // Buscar con filtros (para la página de admin)
  buscar: async (kioscoId: number, filtros: any): Promise<GastoResponse[]> => {
    try {
      const response = await apiClient.post<GastoResponse[]>(
        `/Gastos/kiosco/${kioscoId}/buscar`,
        filtros
      );
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },
};

// ────────────────────────────────────────────────────────────────────────────
// TIPOS DE GASTO API
// ────────────────────────────────────────────────────────────────────────────

export const tiposGastoApi = {

  getByKiosco: async (kioscoId: number): Promise<TipoDeGasto[]> => {
    try {
      const response = await apiClient.get<TipoDeGasto[]>(
        `/TiposDeGasto/kiosco/${kioscoId}`
      );
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  getActivos: async (): Promise<TipoDeGasto[]> => {
    try {
      const response = await apiClient.get<TipoDeGasto[]>('/TiposDeGasto/activos');
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },
};