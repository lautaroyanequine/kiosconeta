// ════════════════════════════════════════════════════════════════════════════
// API: Promociones
// ════════════════════════════════════════════════════════════════════════════

import apiClient, { handleResponse, handleError } from './client';

export type TipoPromocion = 1 | 2 | 3; // Combo | Cantidad | Porcentaje

export interface PromocionProductoDTO {
  productoId: number;
  productoNombre: string;
  cantidad: number;
  precioUnitario: number;
}

export interface PromocionResponseDTO {
  promocionId: number;
  nombre: string;
  descripcion?: string;
  tipo: TipoPromocion;
  tipoNombre: string;
  activa: boolean;
  fechaDesde?: string;
  fechaHasta?: string;
  // Combo
  precioCombo?: number;
  productos: PromocionProductoDTO[];
  // Cantidad
  cantidadRequerida?: number;
  cantidadPaga?: number;
  productoIdCantidad?: number;
  productoNombreCantidad?: string;
  // Porcentaje
  porcentajeDescuento?: number;
  productoIdPorcentaje?: number;
  productoNombrePorcentaje?: string;
  categoriaIdPorcentaje?: number;
  categoriaNombrePorcentaje?: string;
}

export interface CreatePromocionDTO {
  nombre: string;
  descripcion?: string;
  tipo: TipoPromocion;
  fechaDesde?: string;
  fechaHasta?: string;
  // Combo
  precioCombo?: number;
  productos?: { productoId: number; cantidad: number }[];
  // Cantidad
  cantidadRequerida?: number;
  cantidadPaga?: number;
  productoIdCantidad?: number;
  // Porcentaje
  porcentajeDescuento?: number;
  productoIdPorcentaje?: number;
  categoriaIdPorcentaje?: number;
}

export interface ItemCarritoDTO {
  productoId: number;
  cantidad: number;
  precioUnitario: number;
}

export interface PromocionAplicadaDTO {
  promocionId: number;
  nombre: string;
  tipo: TipoPromocion;
  descuento: number;
  descripcion: string;
}

export interface ResultadoPromocionesDTO {
  promocionesAplicadas: PromocionAplicadaDTO[];
  totalOriginal: number;
  totalDescuento: number;
  totalConDescuento: number;
}

export const promocionesApi = {
  getByKiosco: async (kioscoId: number): Promise<PromocionResponseDTO[]> => {
    try {
      const response = await apiClient.get(`/Promocion/kiosco/${kioscoId}`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  create: async (kioscoId: number, dto: CreatePromocionDTO): Promise<PromocionResponseDTO> => {
    try {
      const response = await apiClient.post(`/Promocion/kiosco/${kioscoId}`, dto);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  toggle: async (id: number): Promise<{ activa: boolean }> => {
    try {
      const response = await apiClient.patch(`/Promocion/${id}/toggle`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  delete: async (id: number): Promise<void> => {
    try {
      await apiClient.delete(`/Promocion/${id}`);
    } catch (error) {
      return handleError(error);
    }
  },

  detectar: async (
    kioscoId: number,
    items: ItemCarritoDTO[]
  ): Promise<ResultadoPromocionesDTO> => {
    try {
      const response = await apiClient.post('/Promocion/detectar', {
        kioscoId,
        productos: items,
      });
      return handleResponse(response);
    } catch {
      // Si falla silenciosamente, devolver sin descuento
      return {
        promocionesAplicadas: [],
        totalOriginal: items.reduce((s, i) => s + i.precioUnitario * i.cantidad, 0),
        totalDescuento: 0,
        totalConDescuento: items.reduce((s, i) => s + i.precioUnitario * i.cantidad, 0),
      };
    }
  },
};
