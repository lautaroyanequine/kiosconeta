// ════════════════════════════════════════════════════════════════════════════
// COMPONENT: ImportarProductosModal
//
// Flujo:
// Seleccionar Excel
//      ↓
// Leer estructura
//      ↓
// Mapear columnas
//      ↓
// Vista previa
//      ↓
// Seleccionar filas
//      ↓
// Confirmar importación
//      ↓
// Resultado
// ════════════════════════════════════════════════════════════════════════════

import React, { useRef, useState } from 'react';

import {
  Upload,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';

import { Modal, Button } from '@/components/commons';
import { formatCurrency } from '@/utils/formatters';

import {
  productoImportExportApi,
  type ImportarProductosPreviewResponse,
  type ImportarProductoPreviewItem,
  type ImportarProductosResultado,
  type LeerEstructuraExcelResponse,
  type ColumnaMapeo,
} from '@/apis/prodcutoImportExportApi';

// ────────────────────────────────────────────────────────────────────────────
// TIPOS
// ────────────────────────────────────────────────────────────────────────────

type Paso =
  | 'seleccionar'
  | 'mapear'
  | 'preview'
  | 'resultado';

interface Props {
  isOpen: boolean;
  kioscoId: number;

  onClose: () => void;

  /**
   * Se ejecuta cuando la importación terminó correctamente
   * para que el padre pueda recargar los productos.
   */
  onImportado: () => void;
}

// ────────────────────────────────────────────────────────────────────────────
// CAMPOS DEL MAPEO
// ────────────────────────────────────────────────────────────────────────────

const CAMPOS_OBLIGATORIOS: {
  key:
    | 'nombreColumna'
    | 'categoriaColumna'
    | 'precioCostoColumna'
    | 'precioVentaColumna'
    | 'stockActualColumna'
    | 'stockMinimoColumna';

  label: string;
}[] = [
  {
    key: 'nombreColumna',
    label: 'Nombre del producto',
  },
  {
    key: 'categoriaColumna',
    label: 'Categoría',
  },
  {
    key: 'precioCostoColumna',
    label: 'Precio de costo',
  },
  {
    key: 'precioVentaColumna',
    label: 'Precio de venta',
  },
  {
    key: 'stockActualColumna',
    label: 'Stock actual',
  },
  {
    key: 'stockMinimoColumna',
    label: 'Stock mínimo',
  },
];

const CAMPOS_OPCIONALES: {
  key:
    | 'codigoBarraColumna'
    | 'distribuidorColumna'
    | 'sueltoColumna';

  label: string;
}[] = [
  {
    key: 'codigoBarraColumna',
    label: 'Código de barras',
  },
  {
    key: 'distribuidorColumna',
    label: 'Distribuidor',
  },
  {
    key: 'sueltoColumna',
    label: 'Se vende suelto (Si/No)',
  },
];

// ────────────────────────────────────────────────────────────────────────────
// MAPEO VACÍO
// ────────────────────────────────────────────────────────────────────────────

const crearMapeoVacio = (): ColumnaMapeo => ({
  codigoBarraColumna: null,

  nombreColumna: 0,
  categoriaColumna: 0,

  distribuidorColumna: null,

  precioCostoColumna: 0,
  precioVentaColumna: 0,

  stockActualColumna: 0,
  stockMinimoColumna: 0,

  sueltoColumna: null,

  tieneEncabezados: true,
});

// ────────────────────────────────────────────────────────────────────────────
// BADGE DE ACCIÓN
// ────────────────────────────────────────────────────────────────────────────

const badgeAccion = (
  accion: ImportarProductoPreviewItem['accion']
) => {
  switch (accion) {
    case 'Crear':
      return 'bg-success-50 text-success-700';

    case 'Actualizar':
      return 'bg-primary/10 text-primary';

    case 'Error':
      return 'bg-danger-50 text-danger';

    default:
      return '';
  }
};

// ════════════════════════════════════════════════════════════════════════════
// COMPONENTE
// ════════════════════════════════════════════════════════════════════════════

export const ImportarProductosModal: React.FC<Props> = ({
  isOpen,
  kioscoId,
  onClose,
  onImportado,
}) => {

  // ────────────────────────────────────────────────────────────────────────
  // STATE
  // ────────────────────────────────────────────────────────────────────────

  const [paso, setPaso] = useState<Paso>('seleccionar');

  const [archivo, setArchivo] =
    useState<File | null>(null);

  const [estructura, setEstructura] =
    useState<LeerEstructuraExcelResponse | null>(null);

  const [mapeo, setMapeo] =
    useState<ColumnaMapeo>(crearMapeoVacio);

  const [preview, setPreview] =
    useState<ImportarProductosPreviewResponse | null>(null);

  const [seleccionadas, setSeleccionadas] =
    useState<Set<number>>(new Set());

  const [cargando, setCargando] =
    useState(false);

  const [error, setError] =
    useState('');

  const [resultado, setResultado] =
    useState<ImportarProductosResultado | null>(null);

  const inputRef =
    useRef<HTMLInputElement>(null);

  // ────────────────────────────────────────────────────────────────────────
  // RESET
  // ────────────────────────────────────────────────────────────────────────

  const resetear = () => {
    setPaso('seleccionar');

    setArchivo(null);

    setEstructura(null);

    setMapeo(crearMapeoVacio());

    setPreview(null);

    setSeleccionadas(new Set());

    setError('');

    setResultado(null);

    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleClose = () => {
    resetear();
    onClose();
  };

  // ────────────────────────────────────────────────────────────────────────
  // PASO 1: SELECCIONAR ARCHIVO
  // ────────────────────────────────────────────────────────────────────────

  const handleArchivo = async (file: File) => {

    // Validar extensión
    if (!file.name.toLowerCase().endsWith('.xlsx')) {
      setError(
        'El archivo debe ser un Excel con formato .xlsx'
      );
      return;
    }

    setArchivo(file);

    setCargando(true);

    setError('');

    try {
      const resp =
        await productoImportExportApi.leerEstructura(
          kioscoId,
          file
        );

      setEstructura(resp);

      setMapeo(
        resp.mapeoSugerido ??
        crearMapeoVacio()
      );

      setPaso('mapear');

    } catch (err: unknown) {

      setError(
        err instanceof Error
          ? err.message
          : 'Error al leer el archivo'
      );

    } finally {
      setCargando(false);
    }
  };

  // ────────────────────────────────────────────────────────────────────────
  // VALIDACIÓN DEL MAPEO
  // ────────────────────────────────────────────────────────────────────────

  const mapeoIncompleto =
    CAMPOS_OBLIGATORIOS.some(
      campo => mapeo[campo.key] <= 0
    );

  // ────────────────────────────────────────────────────────────────────────
  // PASO 2: PREVIEW
  // ────────────────────────────────────────────────────────────────────────

  const handleConfirmarMapeo = async () => {

    if (!archivo || mapeoIncompleto) {
      return;
    }

    setCargando(true);

    setError('');

    try {

      const resp =
        await productoImportExportApi.previewImportacion(
          kioscoId,
          archivo,
          mapeo
        );

      setPreview(resp);

      // Por defecto seleccionamos todas las filas
      // que no tienen errores.
      setSeleccionadas(
        new Set(
          resp.items
            .filter(item => item.accion !== 'Error')
            .map(item => item.numeroFila)
        )
      );

      setPaso('preview');

    } catch (err: unknown) {

      setError(
        err instanceof Error
          ? err.message
          : 'Error al procesar el archivo con ese mapeo'
      );

    } finally {
      setCargando(false);
    }
  };

  // ────────────────────────────────────────────────────────────────────────
  // SELECCIONAR / DESELECCIONAR FILA
  // ────────────────────────────────────────────────────────────────────────

  const toggleFila = (numeroFila: number) => {

    setSeleccionadas(prev => {

      const next = new Set(prev);

      if (next.has(numeroFila)) {
        next.delete(numeroFila);
      } else {
        next.add(numeroFila);
      }

      return next;
    });
  };

  // ────────────────────────────────────────────────────────────────────────
  // SELECCIONAR TODAS
  // ────────────────────────────────────────────────────────────────────────

  const toggleTodas = () => {

    if (!preview) {
      return;
    }

    const importables =
      preview.items.filter(
        item => item.accion !== 'Error'
      );

    if (
      seleccionadas.size ===
      importables.length
    ) {
      setSeleccionadas(new Set());
    } else {
      setSeleccionadas(
        new Set(
          importables.map(
            item => item.numeroFila
          )
        )
      );
    }
  };

  // ────────────────────────────────────────────────────────────────────────
  // PASO 3: CONFIRMAR IMPORTACIÓN
  // ────────────────────────────────────────────────────────────────────────

  const handleConfirmarImportacion = async () => {

    if (!preview) {
      return;
    }

    const filas =
      preview.items
        .filter(item =>
          seleccionadas.has(
            item.numeroFila
          )
        )
        .map(item => item.datos);

    if (filas.length === 0) {
      return;
    }

    setCargando(true);

    setError('');

    try {

      const resp =
        await productoImportExportApi.confirmarImportacion(
          kioscoId,
          filas
        );

      setResultado(resp);

      setPaso('resultado');

    } catch (err: unknown) {

      setError(
        err instanceof Error
          ? err.message
          : 'Error al importar los productos'
      );

    } finally {
      setCargando(false);
    }
  };

  // ────────────────────────────────────────────────────────────────────────
  // FINALIZAR
  // ────────────────────────────────────────────────────────────────────────

  const handleFinalizar = () => {
    onImportado();
    handleClose();
  };

  // ────────────────────────────────────────────────────────────────────────
  // DATOS CALCULADOS
  // ────────────────────────────────────────────────────────────────────────

  const importables =
    preview?.items.filter(
      item => item.accion !== 'Error'
    ) ?? [];

  const todasSeleccionadas =
    importables.length > 0 &&
    seleccionadas.size ===
      importables.length;

  const tamañoModal =
    paso === 'preview'
      ? 'xl'
      : paso === 'mapear'
        ? 'lg'
        : 'md';

  // ════════════════════════════════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════════════════════════════════

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Importar productos desde Excel"
      size={tamañoModal}
      footer={

        // ────────────────────────────────────────────────────────────────
        // FOOTER: SELECCIONAR
        // ────────────────────────────────────────────────────────────────

        paso === 'seleccionar' ? (

          <Button
            variant="outline"
            onClick={handleClose}
          >
            Cancelar
          </Button>

        ) :

        // ────────────────────────────────────────────────────────────────
        // FOOTER: MAPEAR
        // ────────────────────────────────────────────────────────────────

        paso === 'mapear' ? (

          <>
            <Button
              variant="outline"
              onClick={() =>
                setPaso('seleccionar')
              }
              disabled={cargando}
              leftIcon={
                <ArrowLeft size={14} />
              }
            >
              Atrás
            </Button>

            <Button
              variant="primary"
              onClick={handleConfirmarMapeo}
              loading={cargando}
              disabled={mapeoIncompleto}
              rightIcon={
                <ArrowRight size={14} />
              }
            >
              Continuar
            </Button>
          </>

        ) :

        // ────────────────────────────────────────────────────────────────
        // FOOTER: PREVIEW
        // ────────────────────────────────────────────────────────────────

        paso === 'preview' ? (

          <>
            <Button
              variant="outline"
              onClick={() =>
                setPaso('mapear')
              }
              disabled={cargando}
              leftIcon={
                <ArrowLeft size={14} />
              }
            >
              Atrás
            </Button>

            <Button
              variant="primary"
              onClick={
                handleConfirmarImportacion
              }
              loading={cargando}
              disabled={
                seleccionadas.size === 0
              }
            >
              Confirmar importación (
              {seleccionadas.size}
              )
            </Button>
          </>

        ) :

        // ────────────────────────────────────────────────────────────────
        // FOOTER: RESULTADO
        // ────────────────────────────────────────────────────────────────

        (
          <Button
            variant="primary"
            onClick={handleFinalizar}
          >
            Listo
          </Button>
        )
      }
    >

      {/* ════════════════════════════════════════════════════════════════════
          ERROR GENERAL
      ════════════════════════════════════════════════════════════════════ */}

      {error && (
        <div className="mb-4 flex items-center gap-2 p-3 bg-danger-50 border border-danger-100 rounded-xl text-sm text-danger">

          <AlertCircle
            size={14}
            className="shrink-0"
          />

          <span>{error}</span>

        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          PASO 1: SELECCIONAR ARCHIVO
      ════════════════════════════════════════════════════════════════════ */}

      {paso === 'seleccionar' && (

        <div>

          <input
            ref={inputRef}
            type="file"
            accept=".xlsx"
            className="hidden"
            onChange={event => {

              const file =
                event.target.files?.[0];

              if (file) {
                handleArchivo(file);
              }

            }}
          />

          <button
            type="button"
            onClick={() =>
              inputRef.current?.click()
            }
            disabled={cargando}
            className="
              w-full
              flex
              flex-col
              items-center
              justify-center
              gap-3
              py-12
              px-4
              border-2
              border-dashed
              border-neutral-300
              rounded-xl
              hover:border-primary
              hover:bg-primary/5
              transition-colors
            "
          >

            {cargando ? (

              <Loader2
                size={32}
                className="animate-spin text-primary"
              />

            ) : (

              <Upload
                size={32}
                className="text-neutral-400"
              />

            )}

            <div className="text-center">

              <p className="text-sm font-medium text-neutral-700">

                {cargando
                  ? 'Leyendo el archivo...'
                  : 'Hacé click para elegir tu Excel (.xlsx)'
                }

              </p>

              <p className="text-xs text-neutral-400 mt-1">
                No hace falta un formato específico.
                En el próximo paso vas a poder indicar
                qué columna corresponde a cada dato.
              </p>

            </div>

          </button>

        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          PASO 2: MAPEAR COLUMNAS
      ════════════════════════════════════════════════════════════════════ */}

      {paso === 'mapear' && estructura && (

        <div className="space-y-4">

          {/* ENCABEZADOS */}

          <label className="
            flex
            items-center
            gap-2
            text-sm
            text-neutral-600
            cursor-pointer
            w-fit
          ">

            <input
              type="checkbox"
              checked={mapeo.tieneEncabezados}
              onChange={event =>
                setMapeo(m => ({
                  ...m,
                  tieneEncabezados:
                    event.target.checked,
                }))
              }
              className="rounded border-neutral-300"
            />

            La primera fila tiene encabezados
            (no es un producto)

          </label>

          {/* VISTA PREVIA DEL EXCEL */}

          <div className="
            border
            border-neutral-200
            rounded-lg
            overflow-x-auto
            max-h-32
          ">

            <table className="text-xs w-full">

              <thead>

                <tr className="bg-neutral-50">

                  {estructura.columnas.map(
                    columna => (

                      <th
                        key={columna.indice}
                        className="
                          px-2
                          py-1.5
                          text-left
                          font-semibold
                          text-neutral-500
                          whitespace-nowrap
                          border-b
                          border-neutral-200
                        "
                      >

                        {columna.letra}

                        {columna.encabezado
                          ? ` — ${columna.encabezado}`
                          : ''
                        }

                      </th>

                    )
                  )}

                </tr>

              </thead>

              <tbody>

                {estructura.filasEjemplo
                  .slice(
                    mapeo.tieneEncabezados
                      ? 1
                      : 0
                  )
                  .map((fila, indiceFila) => (

                    <tr
                      key={indiceFila}
                      className="
                        border-b
                        border-neutral-100
                        last:border-0
                      "
                    >

                      {estructura.columnas.map(
                        columna => (

                          <td
                            key={columna.indice}
                            className="
                              px-2
                              py-1
                              text-neutral-600
                              whitespace-nowrap
                            "
                          >

                            {fila[columna.indice] ||
                              '—'}

                          </td>

                        )
                      )}

                    </tr>

                  ))}

              </tbody>

            </table>

          </div>

          {/* SELECTS DE MAPEO */}

          <div className="
            grid
            grid-cols-1
            sm:grid-cols-2
            gap-3
          ">

            {/* CAMPOS OBLIGATORIOS */}

            {CAMPOS_OBLIGATORIOS.map(
              campo => (

                <div key={campo.key}>

                  <label className="
                    block
                    text-xs
                    font-medium
                    text-neutral-600
                    mb-1
                  ">

                    {campo.label}

                    <span className="text-danger">
                      {' '}*
                    </span>

                  </label>

                  <select
                    value={mapeo[campo.key]}
                    onChange={event =>
                      setMapeo(m => ({
                        ...m,
                        [campo.key]:
                          Number(
                            event.target.value
                          ) || 0,
                      }))
                    }
                    className="
                      w-full
                      px-3
                      py-2
                      text-sm
                      border
                      border-neutral-300
                      rounded-lg
                      focus:outline-none
                      focus:border-primary
                      bg-white
                    "
                  >

                    <option value={0}>
                      — Elegir columna —
                    </option>

                    {estructura.columnas.map(
                      columna => (

                        <option
                          key={columna.indice}
                          value={columna.indice}
                        >

                          {columna.letra}

                          {columna.encabezado
                            ? ` — ${columna.encabezado}`
                            : ' (sin encabezado)'
                          }

                        </option>

                      )
                    )}

                  </select>

                </div>

              )
            )}

            {/* CAMPOS OPCIONALES */}

            {CAMPOS_OPCIONALES.map(
              campo => (

                <div key={campo.key}>

                  <label className="
                    block
                    text-xs
                    font-medium
                    text-neutral-600
                    mb-1
                  ">

                    {campo.label}

                    <span className="text-neutral-400">
                      {' '}(opcional)
                    </span>

                  </label>

                  <select
                    value={
                      mapeo[campo.key] ?? ''
                    }
                    onChange={event =>
                      setMapeo(m => ({
                        ...m,
                        [campo.key]:
                          event.target.value === ''
                            ? null
                            : Number(
                                event.target.value
                              ),
                      }))
                    }
                    className="
                      w-full
                      px-3
                      py-2
                      text-sm
                      border
                      border-neutral-300
                      rounded-lg
                      focus:outline-none
                      focus:border-primary
                      bg-white
                    "
                  >

                    <option value="">
                      — No usar —
                    </option>

                    {estructura.columnas.map(
                      columna => (

                        <option
                          key={columna.indice}
                          value={columna.indice}
                        >

                          {columna.letra}

                          {columna.encabezado
                            ? ` — ${columna.encabezado}`
                            : ' (sin encabezado)'
                          }

                        </option>

                      )
                    )}

                  </select>

                </div>

              )
            )}

          </div>

          {/* AVISO DE MAPEO INCOMPLETO */}

          {mapeoIncompleto && (

            <p className="text-xs text-amber-600">

              Faltan asignar columnas obligatorias
              (marcadas con *) antes de continuar.

            </p>

          )}

        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          PASO 3: VISTA PREVIA
      ════════════════════════════════════════════════════════════════════ */}

      {paso === 'preview' && preview && (

        <div className="space-y-3">

          {/* RESUMEN */}

          <div className="
            flex
            flex-wrap
            items-center
            gap-2
            text-xs
          ">

            <span className="
              px-2.5
              py-1
              rounded-full
              bg-success-50
              text-success-700
              font-medium
            ">
              {preview.totalCrear} nuevos
            </span>

            <span className="
              px-2.5
              py-1
              rounded-full
              bg-primary/10
              text-primary
              font-medium
            ">
              {preview.totalActualizar} a actualizar
            </span>

            {preview.totalErrores > 0 && (

              <span className="
                px-2.5
                py-1
                rounded-full
                bg-danger-50
                text-danger
                font-medium
              ">
                {preview.totalErrores}
                {' '}con error
                {' '}(no se importan)
              </span>

            )}

            <button
              type="button"
              onClick={toggleTodas}
              className="
                ml-auto
                text-xs
                text-primary
                hover:underline
                font-medium
              "
            >

              {todasSeleccionadas
                ? 'Destildar todo'
                : 'Tildar todo lo importable'
              }

            </button>

          </div>

          {/* TABLA */}

          <div className="
            border
            border-neutral-200
            rounded-xl
            overflow-hidden
            max-h-[380px]
            overflow-y-auto
          ">

            <table className="w-full text-xs">

              <thead className="
                sticky
                top-0
                bg-neutral-50
                border-b
                border-neutral-200
              ">

                <tr>

                  <th className="w-8 px-3 py-2">
                  </th>

                  <th className="
                    text-left
                    px-3
                    py-2
                    font-semibold
                    text-neutral-500
                  ">
                    Fila
                  </th>

                  <th className="
                    text-left
                    px-3
                    py-2
                    font-semibold
                    text-neutral-500
                  ">
                    Código
                  </th>

                  <th className="
                    text-left
                    px-3
                    py-2
                    font-semibold
                    text-neutral-500
                  ">
                    Producto
                  </th>

                  <th className="
                    text-left
                    px-3
                    py-2
                    font-semibold
                    text-neutral-500
                  ">
                    Categoría
                  </th>

                  <th className="
                    text-left
                    px-3
                    py-2
                    font-semibold
                    text-neutral-500
                  ">
                    Distribuidor
                  </th>

                  <th className="
                    text-right
                    px-3
                    py-2
                    font-semibold
                    text-neutral-500
                  ">
                    Costo
                  </th>

                  <th className="
                    text-right
                    px-3
                    py-2
                    font-semibold
                    text-neutral-500
                  ">
                    Venta
                  </th>

                  <th className="
                    text-right
                    px-3
                    py-2
                    font-semibold
                    text-neutral-500
                  ">
                    Stock
                  </th>

                  <th className="
                    text-left
                    px-3
                    py-2
                    font-semibold
                    text-neutral-500
                  ">
                    Estado
                  </th>

                </tr>

              </thead>

              <tbody className="
                divide-y
                divide-neutral-100
              ">

                {preview.items.map(item => {

                  const esError =
                    item.accion === 'Error';

                  const marcada =
                    seleccionadas.has(
                      item.numeroFila
                    );

                  return (

                    <tr
                      key={item.numeroFila}
                      className={
                        esError
                          ? 'bg-danger-50/30'
                          : marcada
                            ? ''
                            : 'opacity-50'
                      }
                    >

                      {/* CHECKBOX */}

                      <td className="px-3 py-2">
  <span className={`inline-block px-2 py-0.5 rounded-full font-medium ${badgeAccion(item.accion)}`}>
    {item.accion}
  </span>
  {esError && (
    <p className="text-danger text-[10px] mt-1">{item.errores.join(' / ')}</p>
  )}

  {/* ← AGREGAR ESTE BLOQUE */}
  {!esError && item.advertencias.length > 0 && (
    <p className="text-amber-600 text-[10px] mt-1 max-w-[180px]">
      ⚠ {item.advertencias.join(' / ')}
    </p>
  )}
</td>

                      {/* FILA */}

                      <td className="
                        px-3
                        py-2
                        text-neutral-400
                      ">
                        {item.numeroFila}
                      </td>

                      {/* CÓDIGO */}

                      <td className="
                        px-3
                        py-2
                        text-neutral-500
                        whitespace-nowrap
                      ">
                        {item.datos.codigoBarra ||
                          '—'}
                      </td>

                      {/* PRODUCTO */}

                      <td className="
                        px-3
                        py-2
                        font-medium
                        text-neutral-800
                      ">
                        {item.datos.nombre || '—'}
                      </td>

                      {/* CATEGORÍA */}

                      <td className="
                        px-3
                        py-2
                        text-neutral-600
                      ">

                        {item.datos.categoria ||
                          '—'}

                        {item.categoriaNueva && (

                          <span className="
                            ml-1
                            text-[10px]
                            px-1
                            py-0.5
                            rounded
                            bg-amber-50
                            text-amber-700
                          ">
                            nueva
                          </span>

                        )}

                      </td>

                      {/* DISTRIBUIDOR */}

                      <td className="
                        px-3
                        py-2
                        text-neutral-600
                      ">

                        {item.datos.distribuidor ||
                          '—'}

                        {item.distribuidorNuevo && (

                          <span className="
                            ml-1
                            text-[10px]
                            px-1
                            py-0.5
                            rounded
                            bg-amber-50
                            text-amber-700
                          ">
                            nuevo
                          </span>

                        )}

                      </td>

                      {/* COSTO */}

                      <td className="
                        px-3
                        py-2
                        text-right
                        text-neutral-600
                      ">

                        {formatCurrency(
                          item.datos.precioCosto
                        )}

                        {item.precioCostoAnterior != null &&
                          item.precioCostoAnterior !==
                            item.datos.precioCosto && (

                            <p className="
                              text-[10px]
                              text-neutral-400
                              line-through
                            ">
                              {formatCurrency(
                                item.precioCostoAnterior
                              )}
                            </p>

                          )}

                      </td>

                      {/* VENTA */}

                      <td className="
                        px-3
                        py-2
                        text-right
                        text-neutral-600
                      ">

                        {formatCurrency(
                          item.datos.precioVenta
                        )}

                        {item.precioVentaAnterior != null &&
                          item.precioVentaAnterior !==
                            item.datos.precioVenta && (

                            <p className="
                              text-[10px]
                              text-neutral-400
                              line-through
                            ">
                              {formatCurrency(
                                item.precioVentaAnterior
                              )}
                            </p>

                          )}

                      </td>

                      {/* STOCK */}

                      <td className="
                        px-3
                        py-2
                        text-right
                        text-neutral-600
                      ">

                        {item.datos.stockActual}

                        {item.stockActualAnterior != null &&
                          item.stockActualAnterior !==
                            item.datos.stockActual && (

                            <p className="
                              text-[10px]
                              text-neutral-400
                              line-through
                            ">
                              {item.stockActualAnterior}
                            </p>

                          )}

                      </td>

                      {/* ESTADO */}

                      <td className="px-3 py-2">

                        <span className={`
                          inline-block
                          px-2
                          py-0.5
                          rounded-full
                          font-medium
                          ${badgeAccion(
                            item.accion
                          )}
                        `}>
                          {item.accion}
                        </span>

                        {esError &&
                          item.errores.length > 0 && (

                            <ul className="
                              text-danger
                              text-[10px]
                              mt-1
                              space-y-0.5
                            ">

                              {item.errores.map(
                                (errorFila, index) => (

                                  <li key={index}>
                                    • {errorFila}
                                  </li>

                                )
                              )}

                            </ul>

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

      {/* ════════════════════════════════════════════════════════════════════
          PASO 4: RESULTADO
      ════════════════════════════════════════════════════════════════════ */}

      {paso === 'resultado' && resultado && (

        <div className="space-y-4">

          {/* RESUMEN */}

          <div className="
            flex
            items-center
            gap-3
            p-4
            bg-success-50
            border
            border-success-100
            rounded-xl
          ">

            <CheckCircle2
              size={24}
              className="
                text-success
                shrink-0
              "
            />

            <div>

              <p className="
                text-sm
                font-semibold
                text-success-700
              ">
                Importación completada
              </p>

              <p className="
                text-xs
                text-success-700/80
                mt-0.5
              ">

                {resultado.creados}
                {' '}creados ·{' '}

                {resultado.actualizados}
                {' '}actualizados

                {resultado.categoriasCreadas > 0 &&
                  ` · ${resultado.categoriasCreadas} categorías nuevas`
                }

                {resultado.distribuidoresCreados > 0 &&
                  ` · ${resultado.distribuidoresCreados} distribuidores nuevos`
                }

              </p>

            </div>

          </div>

          {/* ERRORES DE CONFIRMACIÓN */}

          {resultado.errores.length > 0 && (

            <div className="
              p-3
              bg-danger-50
              border
              border-danger-100
              rounded-xl
            ">

              <p className="
                text-xs
                font-semibold
                text-danger
                mb-1.5
              ">

                {resultado.errores.length}
                {' '}
                fila
                {resultado.errores.length !== 1
                  ? 's'
                  : ''
                }
                {' '}no se pudieron importar:

              </p>

              <ul className="
                text-xs
                text-danger
                space-y-1
                max-h-32
                overflow-y-auto
              ">

                {resultado.errores.map(
                  (errorResultado, index) => (

                    <li key={index}>
                      • {errorResultado}
                    </li>

                  )
                )}

              </ul>

            </div>

          )}

        </div>
      )}

    </Modal>
  );
};