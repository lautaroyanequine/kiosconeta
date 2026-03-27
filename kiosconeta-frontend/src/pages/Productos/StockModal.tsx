// ════════════════════════════════════════════════════════════════════════════
// COMPONENT: StockModal — Ajuste rápido de stock
// ════════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect } from 'react';
import { PackagePlus, PackageMinus } from 'lucide-react';
import { Modal, Button } from '@/components/commons';
import type { Producto } from '@/types';

// ────────────────────────────────────────────────────────────────────────────
// TYPES
// ────────────────────────────────────────────────────────────────────────────

interface StockModalProps {
  producto: Producto | null;
  onClose: () => void;
  onAjustar: (productoId: number, cantidad: number) => void;
}

// ────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ────────────────────────────────────────────────────────────────────────────

export const StockModal: React.FC<StockModalProps> = ({
  producto,
  onClose,
  onAjustar,
}) => {
  const [operacion, setOperacion] = useState<'agregar' | 'quitar'>('agregar');
  const [cantidad, setCantidad] = useState('');
  const [error, setError] = useState('');

  // Resetear al abrir
  useEffect(() => {
    if (producto) {
      setOperacion('agregar');
      setCantidad('');
      setError('');
    }
  }, [producto]);

  if (!producto) return null;

  const stockResultante =
    cantidad && !isNaN(Number(cantidad))
      ? operacion === 'agregar'
        ? producto.stockActual + Number(cantidad)
        : producto.stockActual - Number(cantidad)
      : producto.stockActual;

  const handleConfirmar = () => {
    const n = Number(cantidad);
    if (!cantidad || isNaN(n) || n <= 0) {
      setError('Ingresá una cantidad válida mayor a 0');
      return;
    }
    if (operacion === 'quitar' && n > producto.stockActual) {
      setError(`No podés quitar más de ${producto.stockActual} unidades`);
      return;
    }
    const delta = operacion === 'agregar' ? n : -n;
    onAjustar(producto.productoId, delta);
  };

  return (
    <Modal
      isOpen={!!producto}
      onClose={onClose}
      title="Ajustar stock"
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleConfirmar}>
            Confirmar
          </Button>
        </>
      }
    >
      {/* Info del producto */}
      <div className="mb-5 p-3 bg-neutral-50 rounded-lg">
        <p className="text-sm font-semibold text-neutral-800">{producto.nombre}</p>
        <p className="text-sm text-neutral-500 mt-0.5">
          Stock actual:{' '}
          <span
            className={`font-bold ${
              producto.stockActual === 0
                ? 'text-red-600'
                : producto.stockActual < producto.stockMinimo
                ? 'text-amber-600'
                : 'text-green-600'
            }`}
          >
            {producto.stockActual} unidades
          </span>
        </p>
      </div>

      {/* Operación */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => { setOperacion('agregar'); setError(''); }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${
            operacion === 'agregar'
              ? 'border-green-500 bg-green-50 text-green-700'
              : 'border-neutral-200 text-neutral-500 hover:border-neutral-300'
          }`}
        >
          <PackagePlus size={16} />
          Agregar
        </button>
        <button
          onClick={() => { setOperacion('quitar'); setError(''); }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${
            operacion === 'quitar'
              ? 'border-red-500 bg-red-50 text-red-700'
              : 'border-neutral-200 text-neutral-500 hover:border-neutral-300'
          }`}
        >
          <PackageMinus size={16} />
          Quitar
        </button>
      </div>

      {/* Cantidad */}
      <div className="input-group w-full mb-4">
        <label className="input-label">Cantidad</label>
        <input
          type="number"
          min="1"
          placeholder="0"
          autoFocus
          value={cantidad}
          onChange={(e) => { setCantidad(e.target.value); setError(''); }}
          onKeyDown={(e) => e.key === 'Enter' && handleConfirmar()}
          className={`px-4 py-2 border rounded-md w-full text-xl font-bold text-center
            focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-20
            ${error ? 'border-danger' : 'border-neutral-300 focus:border-primary'}`}
        />
        {error && <span className="input-error">{error}</span>}
      </div>

      {/* Stock resultante */}
      {cantidad && !isNaN(Number(cantidad)) && Number(cantidad) > 0 && (
        <div className="text-center p-3 bg-neutral-50 rounded-lg">
          <p className="text-xs text-neutral-500 mb-1">Stock resultante</p>
          <p
            className={`text-2xl font-bold ${
              stockResultante < 0
                ? 'text-red-600'
                : stockResultante < producto.stockMinimo
                ? 'text-amber-600'
                : 'text-green-600'
            }`}
          >
            {stockResultante} unidades
          </p>
        </div>
      )}
    </Modal>
  );
};