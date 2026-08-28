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

  /**
   * Acción que se realizará al confirmar:
   * - Crear
   * - Actualizar
   * - Error
   */
  accion: 'Crear' | 'Actualizar' | 'Error';

  productoIdExistente: number | null;

  categoriaNueva: boolean;
  distribuidorNuevo: boolean;

  errores: string[];
advertencias: string[]; 
  // Valores anteriores cuando la acción es "Actualizar"
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
// MAPEO DE COLUMNAS
// ────────────────────────────────────────────────────────────────────────────

export interface ColumnaExcel {
  /**
   * Índice 1-based de la columna.
   * Ejemplo:
   * A = 1
   * B = 2
   */
  indice: number;

  letra: string;

  /**
   * Encabezado detectado en la primera fila.
   */
  encabezado: string | null;
}

export interface ColumnaMapeo {
  codigoBarraColumna: number | null;

  nombreColumna: number;
  categoriaColumna: number;

  distribuidorColumna: number | null;

  precioCostoColumna: number;
  precioVentaColumna: number;

  stockActualColumna: number;
  stockMinimoColumna: number;

  sueltoColumna: number | null;

  /**
   * Indica si la primera fila del Excel contiene encabezados.
   */
  tieneEncabezados: boolean;
}

/**
 * Propiedades de ColumnaMapeo que representan columnas del Excel.
 *
 * Excluimos "tieneEncabezados" porque es un boolean
 * y no una columna numérica.
 */
export type CampoColumnaMapeo = Exclude<
  keyof ColumnaMapeo,
  'tieneEncabezados'
>;

export interface LeerEstructuraExcelResponse {
  columnas: ColumnaExcel[];

  /**
   * Primeras filas del Excel.
   * La clave representa el índice de la columna.
   */
  filasEjemplo: Record<number, string>[];

  /**
   * Mapeo sugerido automáticamente por el backend.
   */
  mapeoSugerido: ColumnaMapeo | null;
}

// ────────────────────────────────────────────────────────────────────────────
// API
// ────────────────────────────────────────────────────────────────────────────

export const productoImportExportApi = {

  // ────────────────────────────────────────────────────────────────────────
  // EXPORTAR
  // ────────────────────────────────────────────────────────────────────────

  /**
   * Descarga el catálogo completo como .xlsx.
   */
  exportar: async (kioscoId: number): Promise<Blob> => {
    try {
      const response = await apiClient.get(
        `/Productos/kiosco/${kioscoId}/exportar`,
        {
          responseType: 'blob',
        }
      );

      return response.data as Blob;
    } catch (error) {
      return handleError(error);
    }
  },

  // ────────────────────────────────────────────────────────────────────────
  // LEER ESTRUCTURA
  // ────────────────────────────────────────────────────────────────────────

  /**
   * Sube un Excel y devuelve:
   *
   * - columnas detectadas
   * - filas de ejemplo
   * - sugerencia automática de mapeo
   *
   * No persiste nada.
   */
  leerEstructura: async (
    kioscoId: number,
    archivo: File
  ): Promise<LeerEstructuraExcelResponse> => {
    try {
      const formData = new FormData();

      formData.append('archivo', archivo);

      const response =
        await apiClient.post<LeerEstructuraExcelResponse>(
          `/Productos/kiosco/${kioscoId}/importar/leer-estructura`,
          formData
        );

      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // ────────────────────────────────────────────────────────────────────────
  // PREVIEW
  // ────────────────────────────────────────────────────────────────────────

  /**
   * Sube:
   *
   * - Excel
   * - mapeo de columnas
   *
   * y devuelve la vista previa.
   *
   * NO persiste información.
   */
  previewImportacion: async (
    kioscoId: number,
    archivo: File,
    mapeo: ColumnaMapeo
  ): Promise<ImportarProductosPreviewResponse> => {
    try {
      const formData = new FormData();

      // Archivo
      formData.append('archivo', archivo);

      // Código de barras (opcional)
      if (mapeo.codigoBarraColumna != null) {
        formData.append(
          'codigoBarraColumna',
          String(mapeo.codigoBarraColumna)
        );
      }

      // Campos obligatorios
      formData.append(
        'nombreColumna',
        String(mapeo.nombreColumna)
      );

      formData.append(
        'categoriaColumna',
        String(mapeo.categoriaColumna)
      );

      formData.append(
        'precioCostoColumna',
        String(mapeo.precioCostoColumna)
      );

      formData.append(
        'precioVentaColumna',
        String(mapeo.precioVentaColumna)
      );

      formData.append(
        'stockActualColumna',
        String(mapeo.stockActualColumna)
      );

      formData.append(
        'stockMinimoColumna',
        String(mapeo.stockMinimoColumna)
      );

      // Distribuidor (opcional)
      if (mapeo.distribuidorColumna != null) {
        formData.append(
          'distribuidorColumna',
          String(mapeo.distribuidorColumna)
        );
      }

      // Suelto (opcional)
      if (mapeo.sueltoColumna != null) {
        formData.append(
          'sueltoColumna',
          String(mapeo.sueltoColumna)
        );
      }

      // Encabezados
      formData.append(
        'tieneEncabezados',
        String(mapeo.tieneEncabezados)
      );

      const response =
        await apiClient.post<ImportarProductosPreviewResponse>(
          `/Productos/kiosco/${kioscoId}/importar/preview`,
          formData
        );

      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },

  // ────────────────────────────────────────────────────────────────────────
  // CONFIRMAR IMPORTACIÓN
  // ────────────────────────────────────────────────────────────────────────

  /**
   * Confirma la importación de las filas seleccionadas.
   *
   * Esta operación SÍ persiste los cambios en la base de datos.
   */
  confirmarImportacion: async (
    kioscoId: number,
    filas: ImportarProductoFila[]
  ): Promise<ImportarProductosResultado> => {
    try {
      const response =
        await apiClient.post<ImportarProductosResultado>(
          `/Productos/kiosco/${kioscoId}/importar/confirmar`,
          {
            filas,
          }
        );

      return handleResponse(response);
    } catch (error) {
      return handleError(error);
    }
  },
};

// ────────────────────────────────────────────────────────────────────────────
// HELPER: DESCARGAR BLOB
// ────────────────────────────────────────────────────────────────────────────

export const descargarBlob = (
  blob: Blob,
  nombreArchivo: string
) => {
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement('a');

  a.href = url;
  a.download = nombreArchivo;

  document.body.appendChild(a);

  a.click();

  a.remove();

  window.URL.revokeObjectURL(url);
};