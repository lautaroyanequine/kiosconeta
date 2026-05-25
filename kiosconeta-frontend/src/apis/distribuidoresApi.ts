import apiClient, { handleResponse, handleError } from './client';
import type { Distribuidor, CreateDistribuidorDTO } from '@/types';

export const distribuidoresApi = {
  getByKiosco: async (kioscoId: number): Promise<Distribuidor[]> => {
    try {
      const response = await apiClient.get(`/Distribuidor/kiosco/${kioscoId}`);
      return handleResponse(response);
    } catch (error) { return handleError(error); }
  },

  create: async (kioscoId: number, dto: CreateDistribuidorDTO): Promise<Distribuidor> => {
    try {
      const response = await apiClient.post(`/Distribuidor/kiosco/${kioscoId}`, dto);
      return handleResponse(response);
    } catch (error) { return handleError(error); }
  },

  update: async (id: number, dto: CreateDistribuidorDTO & { activo: boolean }): Promise<Distribuidor> => {
    try {
      const response = await apiClient.put(`/Distribuidor/${id}`, dto);
      return handleResponse(response);
    } catch (error) { return handleError(error); }
  },

  delete: async (id: number): Promise<void> => {
    try {
      await apiClient.delete(`/Distribuidor/${id}`);
    } catch (error) { return handleError(error); }
  },
};