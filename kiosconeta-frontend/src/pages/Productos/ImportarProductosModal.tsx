// ════════════════════════════════════════════════════════════════════════════
// COMPONENT: ImportarProductosModal
// Sube un Excel, muestra la vista previa (crear/actualizar/error) y confirma.
// ════════════════════════════════════════════════════════════════════════════

import React, { useState, useRef } from 'react';
import {
  Upload, X, AlertCircle, CheckCircle2, FileSpreadsheet,
  Plus, RefreshCw, Loader2,
} from 'lucide-react';
import { Modal, Button } from '@/components/commons';
import { formatCurrency } from '@/utils/formatters';
import {
  productoImportExportApi,
  type ImportarProductosPreviewResponse,
  type ImportarProductoPreviewItem,
  type ImportarProductosResultado,
} from '@/apis/prodcutoImportExportApi';

type Paso = 'seleccionar' | 'preview' | 'resultado';

interface Props {
  isOpen: boolean;
  kioscoId: number;
  onClose: () => void;
  onImportado: () => void; // el padre recarga la lista de productos
}

const badgeAccion = (accion: ImportarProductoPreviewItem['accion']) => {
  switch (accion) {
    case 'Crear':
      return 'bg-success-50 text-success-700';
    case 'Actualizar':
      return 'bg-primary/10 text-primary';
    case 'Error':
      return 'bg-danger-50 text-danger';
  }
};

export const ImportarProductosModal: React.FC<Props> = ({ isOpen, kioscoId, onClose, onImportado }) => {
  const [paso, setPaso] = useState<Paso>('seleccionar');
  const [archivo, setArchivo] = useState<File | null>(null);
  const [preview, setPreview] = useState<ImportarProductosPreviewResponse | null>(null);
  const [seleccionadas, setSeleccionadas] = useState<Set<number>>(new Set());
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [resultado, setResultado] = useState<ImportarProductosResultado | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const resetear = () => {
    setPaso('seleccionar');
    setArchivo(null);
    setPreview(null);
    setSeleccionadas(new Set());
    setError('');
    setResultado(null);
  };

  const handleClose = () => {
    resetear();
    onClose();
  };

  // ── Paso 1: elegir archivo → pedir preview ──────────────────────────────
  const handleArchivo = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.xlsx')) {
      setError('El archivo debe ser un Excel (.xlsx)');
      return;
    }
    setArchivo(file);
    setCargando(true);
    setError('');
    try {
      const resp = await productoImportExportApi.previewImportacion(kioscoId, file);
      setPreview(resp);
      // Por defecto: tildar todo lo que no tenga error
      setSeleccionadas(new Set(
        resp.items.filter(i => i.accion !== 'Error').map(i => i.numeroFila)
      ));
      setPaso('preview');
    } catch (err: any) {
      setError(err.message || 'Error al leer el archivo');
    } finally {
      setCargando(false);
    }
  };

  const toggleFila = (numeroFila: number) => {
    setSeleccionadas(prev => {
      const next = new Set(prev);
      if (next.has(numeroFila)) next.delete(numeroFila);
      else next.add(numeroFila);
      return next;
    });
  };

  const toggleTodas = () => {
    if (!preview) return;
    const importables = preview.items.filter(i => i.accion !== 'Error');
    if (seleccionadas.size === importables.length) {
      setSeleccionadas(new Set());
    } else {
      setSeleccionadas(new Set(importables.map(i => i.numeroFila)));
    }
  };

  // ── Paso 2: confirmar importación ───────────────────────────────────────
  const handleConfirmar = async () => {
    if (!preview) return;
    const filas = preview.items
      .filter(i => seleccionadas.has(i.numeroFila))
      .map(i => i.datos);

    if (filas.length === 0) return;

    setCargando(true);
    setError('');
    try {
      const resp = await productoImportExportApi.confirmarImportacion(kioscoId, filas);
      setResultado(resp);
      setPaso('resultado');
    } catch (err: any) {
      setError(err.message || 'Error al importar los productos');
    } finally {
      setCargando(false);
    }
  };

  const handleFinalizar = () => {
    onImportado();
    handleClose();
  };

  const importables = preview?.items.filter(i => i.accion !== 'Error') ?? [];
  const todasSeleccionadas = importables.length > 0 && seleccionadas.size === importables.length;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Importar productos desde Excel"
      size={paso === 'preview' ? 'xl' : 'md'}
      footer={
        paso === 'seleccionar' ? (
          <Button variant="outline" onClick={handleClose}>Cancelar</Button>
        ) : paso === 'preview' ? (
          <>
            <Button variant="outline" onClick={handleClose} disabled={cargando}>Cancelar</Button>
            <Button
              variant="primary"
              onClick={handleConfirmar}
              loading={cargando}
              disabled={seleccionadas.size === 0}
            >
              Confirmar importación ({seleccionadas.size})
            </Button>
          </>
        ) : (
          <Button variant="primary" onClick={handleFinalizar}>Listo</Button>
        )
      }
    >
      {error && (
        <div className="mb-4 flex items-center gap-2 p-3 bg-danger-50 border border-danger-100 rounded-xl text-sm text-danger">
          <AlertCircle size={14} className="shrink-0" />
          {error}
        </div>
      )}

      {/* ── PASO 1: SELECCIONAR ARCHIVO ─────────────────────────────────── */}
      {paso === 'seleccionar' && (
        <div>
          <input
            ref={inputRef}
            type="file"
            accept=".xlsx"
            className="hidden"
            onChange={e => e.target.files?.[0] && handleArchivo(e.target.files[0])}
          />
          <button
            onClick={() => inputRef.current?.click()}
            disabled={cargando}
            className="w-full flex flex-col items-center justify-center gap-3 py-12 px-4
                       border-2 border-dashed border-neutral-300 rounded-xl
                       hover:border-primary hover:bg-primary/5 transition-colors"
          >
            {cargando ? (
              <Loader2 size={32} className="animate-spin text-primary" />
            ) : (
              <Upload size={32} className="text-neutral-400" />
            )}
            <div className="text-center">
              <p className="text-sm font-medium text-neutral-700">
                {cargando ? 'Leyendo el archivo...' : 'Hacé click para elegir tu Excel (.xlsx)'}
              </p>
              <p className="text-xs text-neutral-400 mt-1">
                Usá el mismo formato que descargás con "Exportar"
              </p>
            </div>
          </button>
        </div>
      )}

      {/* ── PASO 2: VISTA PREVIA ────────────────────────────────────────── */}
      {paso === 'preview' && preview && (
        <div className="space-y-3">
          {/* Resumen */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="px-2.5 py-1 rounded-full bg-success-50 text-success-700 font-medium">
              {preview.totalCrear} nuevos
            </span>
            <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium">
              {preview.totalActualizar} a actualizar
            </span>
            {preview.totalErrores > 0 && (
              <span className="px-2.5 py-1 rounded-full bg-danger-50 text-danger font-medium">
                {preview.totalErrores} con error (no se importan)
              </span>
            )}
            <button
              onClick={toggleTodas}
              className="ml-auto text-xs text-primary hover:underline font-medium"
            >
              {todasSeleccionadas ? 'Destildar todo' : 'Tildar todo lo importable'}
            </button>
          </div>

          {/* Tabla de filas */}
          <div className="border border-neutral-200 rounded-xl overflow-hidden max-h-[420px] overflow-y-auto">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="w-8 px-3 py-2"></th>
                  <th className="text-left px-3 py-2 font-semibold text-neutral-500">Fila</th>
                  <th className="text-left px-3 py-2 font-semibold text-neutral-500">Producto</th>
                  <th className="text-left px-3 py-2 font-semibold text-neutral-500">Categoría</th>
                  <th className="text-left px-3 py-2 font-semibold text-neutral-500">Distribuidor</th>
                  <th className="text-right px-3 py-2 font-semibold text-neutral-500">Costo</th>
                  <th className="text-right px-3 py-2 font-semibold text-neutral-500">Venta</th>
                  <th className="text-right px-3 py-2 font-semibold text-neutral-500">Stock</th>
                  <th className="text-left px-3 py-2 font-semibold text-neutral-500">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {preview.items.map(item => {
                  const esError = item.accion === 'Error';
                  const marcada = seleccionadas.has(item.numeroFila);
                  return (
                    <tr key={item.numeroFila} className={esError ? 'bg-danger-50/30' : marcada ? '' : 'opacity-50'}>
                      <td className="px-3 py-2">
                        <input
                          type="checkbox"
                          checked={marcada}
                          disabled={esError}
                          onChange={() => toggleFila(item.numeroFila)}
                          className="rounded border-neutral-300"
                        />
                      </td>
                      <td className="px-3 py-2 text-neutral-400">{item.numeroFila}</td>
                      <td className="px-3 py-2 font-medium text-neutral-800">{item.datos.nombre || '—'}</td>
                      <td className="px-3 py-2 text-neutral-600">
                        {item.datos.categoria || '—'}
                        {item.categoriaNueva && (
                          <span className="ml-1 text-[10px] px-1 py-0.5 rounded bg-amber-50 text-amber-700">nueva</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-neutral-600">
                        {item.datos.distribuidor || '—'}
                        {item.distribuidorNuevo && (
                          <span className="ml-1 text-[10px] px-1 py-0.5 rounded bg-amber-50 text-amber-700">nuevo</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-right text-neutral-600">
                        {formatCurrency(item.datos.precioCosto)}
                        {item.precioCostoAnterior != null && item.precioCostoAnterior !== item.datos.precioCosto && (
                          <p className="text-[10px] text-neutral-400 line-through">
                            {formatCurrency(item.precioCostoAnterior)}
                          </p>
                        )}
                      </td>
                      <td className="px-3 py-2 text-right text-neutral-600">
                        {formatCurrency(item.datos.precioVenta)}
                        {item.precioVentaAnterior != null && item.precioVentaAnterior !== item.datos.precioVenta && (
                          <p className="text-[10px] text-neutral-400 line-through">
                            {formatCurrency(item.precioVentaAnterior)}
                          </p>
                        )}
                      </td>
                      <td className="px-3 py-2 text-right text-neutral-600">
                        {item.datos.stockActual}
                        {item.stockActualAnterior != null && item.stockActualAnterior !== item.datos.stockActual && (
                          <p className="text-[10px] text-neutral-400 line-through">{item.stockActualAnterior}</p>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <span className={`inline-block px-2 py-0.5 rounded-full font-medium ${badgeAccion(item.accion)}`}>
                          {item.accion}
                        </span>
                        {esError && (
                          <p className="text-danger text-[10px] mt-1">{item.errores.join(' / ')}</p>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── PASO 3: RESULTADO ───────────────────────────────────────────── */}
      {paso === 'resultado' && resultado && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-success-50 border border-success-100 rounded-xl">
            <CheckCircle2 size={24} className="text-success shrink-0" />
            <div>
              <p className="text-sm font-semibold text-success-700">Importación completada</p>
              <p className="text-xs text-success-700/80 mt-0.5">
                {resultado.creados} creados · {resultado.actualizados} actualizados
                {resultado.categoriasCreadas > 0 && ` · ${resultado.categoriasCreadas} categorías nuevas`}
                {resultado.distribuidoresCreados > 0 && ` · ${resultado.distribuidoresCreados} distribuidores nuevos`}
              </p>
            </div>
          </div>

          {resultado.errores.length > 0 && (
            <div className="p-3 bg-danger-50 border border-danger-100 rounded-xl">
              <p className="text-xs font-semibold text-danger mb-1.5">
                {resultado.errores.length} fila{resultado.errores.length !== 1 ? 's' : ''} no se pudieron importar:
              </p>
              <ul className="text-xs text-danger space-y-1 max-h-32 overflow-y-auto">
                {resultado.errores.map((e, i) => <li key={i}>• {e}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};