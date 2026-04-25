// ════════════════════════════════════════════════════════════════════════════
// COMPONENT: ProductoModal — Formulario crear/editar producto
// ════════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect } from 'react';
import { Modal, Input, Button } from '@/components/commons';
import { calcularMargenGanancia } from '@/utils/helpers';
import { formatCurrency } from '@/utils/formatters';
import { useAuth } from '@/contexts/AuthContext'
import type { Producto, Categoria, CreateProductoDTO, UpdateProductoDTO } from '@/types';
import type { ModalMode } from './useProductos';

// ────────────────────────────────────────────────────────────────────────────
// TYPES
// ────────────────────────────────────────────────────────────────────────────

interface ProductoModalProps {
  mode: ModalMode;
  producto: Producto | null;
  categorias: Categoria[];
  isSaving: boolean;
  saveError: string | null;
  onClose: () => void;
  onSave: (data: CreateProductoDTO | UpdateProductoDTO) => void;
}

interface FormState {
  nombre: string;
  codigoBarras: string;
  precioCosto: string;
  precioVenta: string;
  stock: string;
  stockMinimo: string;
  categoriaId: string;
  fechaVencimiento: string;
}

const FORM_INICIAL: FormState = {
  nombre: '',
  codigoBarras: '',
  precioCosto: '',
  precioVenta: '',
  stock: '',
  stockMinimo: '10',
  categoriaId: '',
  fechaVencimiento: '',
};

// ────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ────────────────────────────────────────────────────────────────────────────

export const ProductoModal: React.FC<ProductoModalProps> = ({
  mode,
  producto,
  categorias,
  isSaving,
  saveError,
  onClose,
  onSave,
}) => {
  const [form, setForm] = useState<FormState>(FORM_INICIAL);
  const [errores, setErrores] = useState<Partial<FormState>>({});

  // Poblar el form al editar
  useEffect(() => {
    if (mode === 'editar' && producto) {
      setForm({
        nombre: producto.nombre,
        codigoBarras: producto.codigoBarra || '',
        precioCosto: String(producto.precioCosto),
        precioVenta: String(producto.precioVenta),
        stock: String(producto.stockActual),
        stockMinimo: String(producto.stockMinimo),
        categoriaId: String(producto.categoriaId),
        fechaVencimiento: producto.fechaVencimiento
          ? producto.fechaVencimiento.split('T')[0]
          : '',
      });
    } else {
      setForm(FORM_INICIAL);
    }
    setErrores({});
  }, [mode, producto]);

  // ── Handlers ──────────────────────────────────────────────────────────

  const handleChange = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    // Limpiar error del campo al editar
    if (errores[field]) {
      setErrores((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // ── Validación ────────────────────────────────────────────────────────

  const validar = (): boolean => {
    const nuevosErrores: Partial<FormState> = {};

    if (!form.nombre.trim()) nuevosErrores.nombre = 'El nombre es requerido';
    if (!form.precioCosto || Number(form.precioCosto) < 0)
      nuevosErrores.precioCosto = 'Ingresá un precio de costo válido';
    if (!form.precioVenta || Number(form.precioVenta) <= 0)
      nuevosErrores.precioVenta = 'El precio de venta debe ser mayor a 0';
    if (form.stock === '' || Number(form.stock) < 0)
      nuevosErrores.stock = 'El stock no puede ser negativo';
    if (!form.stockMinimo || Number(form.stockMinimo) < 0)
      nuevosErrores.stockMinimo = 'Ingresá un stock mínimo válido';
    if (!form.categoriaId)
      nuevosErrores.categoriaId = 'Seleccioná una categoría';

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  // ── Submit ────────────────────────────────────────────────────────────
  const { user } = useAuth()
  const handleSubmit = () => {
    if (!validar()) return;

    const base = {
      nombre: form.nombre.trim(),
      codigoBarra: form.codigoBarras.trim() || undefined,
      precioCosto: Number(form.precioCosto),
      precioVenta: Number(form.precioVenta),
      stockActual: Number(form.stock),
      stockMinimo: Number(form.stockMinimo),
      categoriaId: Number(form.categoriaId),
      fechaVencimiento: form.fechaVencimiento || undefined,
      suelto: false,
      kioscoId: user!.kioscoId,
    };

    if (mode === 'editar' && producto) {
      onSave({
        ...base,
        productoId: producto.productoId,
        activo: producto.activo,
      } as UpdateProductoDTO);
    } else {
      onSave(base as CreateProductoDTO);
    }
  };

  // ── Margen calculado en tiempo real ───────────────────────────────────

  const margen =
    form.precioCosto && form.precioVenta
      ? calcularMargenGanancia(Number(form.precioVenta), Number(form.precioCosto))
      : null;

  // ────────────────────────────────────────────────────────────────────────
  // RENDER
  // ────────────────────────────────────────────────────────────────────────

  return (
    <Modal
      isOpen={mode !== null}
      onClose={onClose}
      title={mode === 'crear' ? 'Nuevo producto' : 'Editar producto'}
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSubmit} loading={isSaving}>
            {mode === 'crear' ? 'Crear producto' : 'Guardar cambios'}
          </Button>
        </>
      }
    >
      {/* Error de guardado */}
      {saveError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {saveError}
        </div>
      )}

      <div className="space-y-4">
        {/* Nombre */}
        <Input
          label="Nombre"
          placeholder="Ej: Coca Cola 500ml"
          value={form.nombre}
          onChange={(e) => handleChange('nombre', e.target.value)}
          error={errores.nombre}
          required
          autoFocus
        />

        {/* Código de barras */}
        <Input
          label="Código de barras"
          placeholder="Ej: 7790895000051"
          value={form.codigoBarras}
          onChange={(e) => handleChange('codigoBarras', e.target.value)}
        />

        {/* Precios */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Input
              label="Precio de costo"
              type="number"
              min="0"
              step="0.01"
              placeholder="0,00"
              value={form.precioCosto}
              onChange={(e) => handleChange('precioCosto', e.target.value)}
              error={errores.precioCosto}
              required
            />
          </div>
          <div>
            <Input
              label="Precio de venta"
              type="number"
              min="0"
              step="0.01"
              placeholder="0,00"
              value={form.precioVenta}
              onChange={(e) => handleChange('precioVenta', e.target.value)}
              error={errores.precioVenta}
              required
            />
          </div>
        </div>

        {/* Margen calculado */}
        {margen !== null && (
          <div
            className={`text-sm px-3 py-2 rounded-lg ${
              margen >= 0
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            Margen de ganancia:{' '}
            <strong>
              {margen >= 0 ? '+' : ''}
              {margen.toFixed(1)}%
            </strong>
            {form.precioCosto && form.precioVenta && (
              <span className="ml-2 opacity-70">
                (ganás {formatCurrency(Number(form.precioVenta) - Number(form.precioCosto))} por
                unidad)
              </span>
            )}
          </div>
        )}

        {/* Stock */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Stock actual"
            type="number"
            min="0"
            step="1"
            placeholder="0"
            value={form.stock}
            onChange={(e) => handleChange('stock', e.target.value)}
            error={errores.stock}
            required
          />
          <Input
            label="Stock mínimo"
            type="number"
            min="0"
            step="1"
            placeholder="10"
            value={form.stockMinimo}
            onChange={(e) => handleChange('stockMinimo', e.target.value)}
            error={errores.stockMinimo}
            helperText="Umbral para alertas de stock bajo"
            required
          />
        </div>

        {/* Categoría */}
        <div className="input-group w-full">
          <label className="input-label">
            Categoría <span className="text-danger ml-1">*</span>
          </label>
          <select
            className={`px-4 py-2 border rounded-md w-full transition-colors duration-200
              focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-20
              ${errores.categoriaId ? 'border-danger' : 'border-neutral-300 focus:border-primary'}
              bg-white text-neutral-800`}
            value={form.categoriaId}
            onChange={(e) => handleChange('categoriaId', e.target.value)}
          >
            <option value="">Seleccioná una categoría</option>
            {categorias
              .filter((c) => c.activo !== false)
              .map((cat) => (
                <option key={cat.categoriaID} value={cat.categoriaID}>
                  {cat.nombre}
                </option>
              ))}
          </select>
          {errores.categoriaId && (
            <span className="input-error">{errores.categoriaId}</span>
          )}
        </div>

        {/* Fecha de vencimiento */}
        <Input
          label="Fecha de vencimiento"
          type="date"
          value={form.fechaVencimiento}
          onChange={(e) => handleChange('fechaVencimiento', e.target.value)}
          helperText="Opcional — solo para productos perecederos"
        />
      </div>
    </Modal>
  );
};