// ════════════════════════════════════════════════════════════════════════════
// COMPONENT: IngresoMercaderiaModal
// Permite buscar un producto, ingresar cantidad, precio de costo y distribuidor.
// ════════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect, useRef } from 'react';
import { Search, PackagePlus, X, TrendingUp } from 'lucide-react';
import { Modal, Button, Input } from '@/components/commons';
import { formatCurrency } from '@/utils/formatters';
import { calcularMargenGanancia } from '@/utils/helpers';
import type { Producto } from '@/types';

// ────────────────────────────────────────────────────────────────────────────
// TYPES
// ────────────────────────────────────────────────────────────────────────────

interface IngresoMercaderiaModalProps {
  isOpen: boolean;
  productos: Producto[];
  onClose: () => void;
  onConfirmar: (
    productoId: number,
    cantidad: number,
    distribuidor: string,
    precioCosto: number
  ) => Promise<void>;
}

// ────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ────────────────────────────────────────────────────────────────────────────

export const IngresoMercaderiaModal: React.FC<IngresoMercaderiaModalProps> = ({
  isOpen,
  productos,
  onClose,
  onConfirmar,
}) => {
  const [busqueda, setBusqueda] = useState('');
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null);
  const [cantidad, setCantidad] = useState('');
  const [distribuidor, setDistribuidor] = useState('');
  const [precioCosto, setPrecioCosto] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  // Reset al abrir
  useEffect(() => {
    if (isOpen) {
      setBusqueda('');
      setProductoSeleccionado(null);
      setCantidad('');
      setDistribuidor('');
      setPrecioCosto('');
      setError('');
      setTimeout(() => searchRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // ── Filtrado ───────────────────────────────────────────────────────

  const productosFiltrados = busqueda.trim().length >= 1
    ? productos.filter((p) => {
        const q = busqueda.toLowerCase();
        return p.nombre.toLowerCase().includes(q) || p.codigoBarra?.toLowerCase().includes(q);
      }).slice(0, 6)
    : [];

  const seleccionar = (p: Producto) => {
    setProductoSeleccionado(p);
    setBusqueda(p.nombre);
    setDistribuidor(p.distribuidor ?? '');
    setPrecioCosto(String(p.precioCosto));
    setError('');
  };

  const limpiarSeleccion = () => {
    setProductoSeleccionado(null);
    setBusqueda('');
    setCantidad('');
    setDistribuidor('');
    setPrecioCosto('');
    setError('');
    setTimeout(() => searchRef.current?.focus(), 50);
  };

  // ── Confirmar ──────────────────────────────────────────────────────

  const handleConfirmar = async () => {
    if (!productoSeleccionado) { setError('Seleccioná un producto'); return; }
    const n = Number(cantidad);
    if (!cantidad || isNaN(n) || n <= 0) { setError('Ingresá una cantidad válida'); return; }
    const costo = Number(precioCosto);
    if (!precioCosto || isNaN(costo) || costo < 0) { setError('Ingresá un precio de costo válido'); return; }

    setIsSaving(true);
    setError('');
    try {
      await onConfirmar(productoSeleccionado.productoId, n, distribuidor.trim(), costo);
    } catch (err: any) {
      setError(err.message || 'Error al registrar el ingreso');
    } finally {
      setIsSaving(false);
    }
  };

  // ── Calculados ─────────────────────────────────────────────────────

  const stockResultante = productoSeleccionado && cantidad && Number(cantidad) > 0
    ? productoSeleccionado.stockActual + Number(cantidad)
    : null;

  const margenNuevo = precioCosto && productoSeleccionado
    ? calcularMargenGanancia(productoSeleccionado.precioVenta, Number(precioCosto))
    : null;

  const costoAnterior = productoSeleccionado?.precioCosto ?? null;
  const costoNuevo = Number(precioCosto);
  const costoSubio = costoAnterior !== null && precioCosto && costoNuevo > costoAnterior;
  const costoBajo = costoAnterior !== null && precioCosto && costoNuevo < costoAnterior;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Ingresar mercadería"
      size="md"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>Cancelar</Button>
          <Button
            variant="primary"
            leftIcon={<PackagePlus size={16} />}
            onClick={handleConfirmar}
            loading={isSaving}
            disabled={!productoSeleccionado || !cantidad || !precioCosto}
          >
            Confirmar ingreso
          </Button>
        </>
      }
    >
      {/* ── Buscar producto ─────────────────────────────────────────── */}
      <div className="mb-4">
        <label className="input-label mb-1 block">
          Producto <span className="text-danger">*</span>
        </label>

        {productoSeleccionado ? (
          <div className="flex items-center gap-3 p-3 bg-primary/5 border border-primary/30 rounded-lg">
            <div className="flex-1">
              <p className="text-sm font-semibold text-neutral-900">{productoSeleccionado.nombre}</p>
              <p className="text-xs text-neutral-500">
                Stock: <strong>{productoSeleccionado.stockActual}</strong>
                {' · '}Costo anterior: <strong>{formatCurrency(productoSeleccionado.precioCosto)}</strong>
                {productoSeleccionado.codigoBarra && ` · ${productoSeleccionado.codigoBarra}`}
              </p>
            </div>
            <button onClick={limpiarSeleccion} className="p-1 rounded-full text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors">
              <X size={16} />
            </button>
          </div>
        ) : (
          <div className="relative">
            <Input
              ref={searchRef}
              placeholder="Buscar por nombre o código de barras..."
              value={busqueda}
              onChange={(e) => { setBusqueda(e.target.value); setError(''); }}
              leftIcon={<Search size={16} />}
            />
            {productosFiltrados.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg z-20 overflow-hidden">
                {productosFiltrados.map((p) => (
                  <button
                    key={p.productoId}
                    onClick={() => seleccionar(p)}
                    className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-neutral-50 transition-colors text-left border-b border-neutral-100 last:border-0"
                  >
                    <div>
                      <p className="text-sm font-medium text-neutral-800">{p.nombre}</p>
                      <p className="text-xs text-neutral-400">
                        Stock: {p.stockActual} · Costo: {formatCurrency(p.precioCosto)}
                        {p.codigoBarra && ` · ${p.codigoBarra}`}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-neutral-700 ml-3">{formatCurrency(p.precioVenta)}</span>
                  </button>
                ))}
              </div>
            )}
            {busqueda.trim().length >= 1 && productosFiltrados.length === 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg z-20 px-4 py-3 text-sm text-neutral-500">
                No se encontraron productos
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Campos (solo si hay producto seleccionado) ──────────────── */}
      {productoSeleccionado && (
        <>
          {/* Cantidad + Stock resultante */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="input-group w-full">
              <label className="input-label mb-1 block">
                Cantidad ingresada <span className="text-danger">*</span>
              </label>
              <input
                type="number" min="1" step="1" placeholder="0" autoFocus
                value={cantidad}
                onChange={(e) => { setCantidad(e.target.value); setError(''); }}
                onKeyDown={(e) => e.key === 'Enter' && handleConfirmar()}
                className={`px-4 py-2.5 border rounded-md w-full text-2xl font-bold text-center
                  focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-20
                  ${error && !cantidad ? 'border-danger' : 'border-neutral-300 focus:border-primary'}`}
              />
            </div>
            <div className="flex flex-col justify-center items-center bg-neutral-50 rounded-lg p-3">
              <p className="text-xs text-neutral-500 mb-1">Stock resultante</p>
              <p className={`text-2xl font-bold ${
                stockResultante === null ? 'text-neutral-300' :
                stockResultante < productoSeleccionado.stockMinimo ? 'text-amber-600' : 'text-green-600'
              }`}>
                {stockResultante ?? '—'}
              </p>
              <p className="text-xs text-neutral-400">unidades</p>
            </div>
          </div>

          {/* Precio de costo */}
          <div className="mb-4">
            <Input
              label="Precio de costo"
              type="number"
              min="0"
              step="0.01"
              placeholder="0,00"
              value={precioCosto}
              onChange={(e) => { setPrecioCosto(e.target.value); setError(''); }}
              helperText={
                costoSubio ? `↑ Subió ${formatCurrency(costoNuevo - costoAnterior!)} respecto al anterior` :
                costoBajo ? `↓ Bajó ${formatCurrency(costoAnterior! - costoNuevo)} respecto al anterior` :
                'Se actualizará en el producto si cambió'
              }
            />
            {/* Margen nuevo */}
            {margenNuevo !== null && precioCosto && (
              <div className={`mt-2 px-3 py-2 rounded-lg text-xs flex items-center gap-1.5 ${
                margenNuevo >= 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
              }`}>
                <TrendingUp size={13} />
                Nuevo margen: <strong>{margenNuevo >= 0 ? '+' : ''}{margenNuevo.toFixed(1)}%</strong>
                <span className="opacity-60 ml-1">
                  (ganás {formatCurrency(productoSeleccionado.precioVenta - costoNuevo)} por unidad)
                </span>
              </div>
            )}
          </div>

          {/* Distribuidor */}
          <Input
            label="Distribuidor"
            placeholder="Ej: Coca Cola S.A., Distribuidora Norte..."
            value={distribuidor}
            onChange={(e) => setDistribuidor(e.target.value)}
            helperText="Se guardará en el producto para referencia futura"
          />
        </>
      )}

      {error && <p className="mt-3 text-sm text-danger">{error}</p>}
    </Modal>
  );
};