import apiClient, { handleResponse, handleError } from './client';
import { API_ENDPOINTS } from '../utils/constants';
import type {
  Turno,
  AbrirTurnoDTO,
  CerrarTurnoDTO,
  CierreTurno,
  TurnoActual,
  CierreTurnoResponse
  
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
 getActual: async (kioscoId: number): Promise<TurnoActual | null> => {
  try {
    const response = await apiClient.get<TurnoActual>(
      API_ENDPOINTS.TURNO_ACTUAL(kioscoId)  // 
    );
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
      console.log(error);
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
  getByKiosco: async (kioscoId: number): Promise<CierreTurnoResponse[]> => {
  try {
    const response = await apiClient.get<CierreTurnoResponse[]>(
      API_ENDPOINTS.TURNOS_KIOSCO(kioscoId)
    );
    return handleResponse(response);
  } catch (error) {
    return handleError(error);
  }
},
};
