// ════════════════════════════════════════════════════════════════════════════
// API: Importación / Exportación de productos (Excel)
// ════════════════════════════════════════════════════════════════════════════

import apiClient, { handleResponse, handleError } from './client';

// ────────────────────────────────────────────────────────────────────────────
// TIPOS
// ────────────────────────────────────────────────────────────────────────────

export interface ImportarProductoFila {
  numeroFila: number;
  codigoBarra: string | null;
  nombre: string;
  categoria: string;
  distribuidor: string | null;
  precioCosto: number;
  precioVenta: number;
  stockActual: number;
  stockMinimo: number;
  suelto: boolean;
}

export interface ImportarProductoPreviewItem {
  numeroFila: number;
  datos: ImportarProductoFila;
  accion: 'Crear' | 'Actualizar' | 'Error';
  productoIdExistente: number | null;
  categoriaNueva: boolean;
  distribuidorNuevo: boolean;
  errores: string[];
  precioCostoAnterior: number | null;
  precioVentaAnterior: number | null;
  stockActualAnterior: number | null;
  stockMinimoAnterior: number | null;
}

export interface ImportarProductosPreviewResponse {
  items: ImportarProductoPreviewItem[];
  totalCrear: number;
  totalActualizar: number;
  totalErrores: number;
}

export interface ImportarProductosResultado {
  creados: number;
  actualizados: number;
  categoriasCreadas: number;
  distribuidoresCreados: number;
  errores: string[];
}

// ────────────────────────────────────────────────────────────────────────────
// API
// ────────────────────────────────────────────────────────────────────────────

export const productoImportExportApi = {
  /**
   * Descarga el catálogo completo como .xlsx (Blob listo para bajar en el navegador)
   */
  exportar: async (kioscoId: number): Promise<Blob> => {
    try {
      const response = await apiClient.get(`/Productos/kiosco/${kioscoId}/exportar`, {
        responseType: 'blob',
      });
      return response.data as Blob;
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Sube el Excel y devuelve la vista previa (no persiste nada todavía)
   */
  previewImportacion: async (
    kioscoId: number,
    archivo: File
  ): Promise<ImportarProductosPreviewResponse> => {
    try {
      const formData = new FormData();
      formData.append('archivo', archivo);
      const response = await apiClient.post<ImportarProductosPreviewResponse>(
        `/Productos/kiosco/${kioscoId}/importar/preview`,
        formData
      );
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  /**
   * Confirma la importación de las filas seleccionadas (persiste en la base)
   */
  confirmarImportacion: async (
    kioscoId: number,
    filas: ImportarProductoFila[]
  ): Promise<ImportarProductosResultado> => {
    try {
      const response = await apiClient.post<ImportarProductosResultado>(
        `/Productos/kiosco/${kioscoId}/importar/confirmar`,
        { filas }
      );
      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },
};

// ────────────────────────────────────────────────────────────────────────────
// HELPER: disparar la descarga del blob en el navegador
// ────────────────────────────────────────────────────────────────────────────

export const descargarBlob = (blob: Blob, nombreArchivo: string) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nombreArchivo;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
};