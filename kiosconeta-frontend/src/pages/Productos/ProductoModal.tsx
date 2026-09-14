// ════════════════════════════════════════════════════════════════════════════
// COMPONENT: ProductoModal — Formulario crear/editar producto
// ════════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect } from 'react';
import { Modal, Input, Button } from '@/components/commons';
import { calcularMargenGanancia } from '@/utils/helpers';
import { formatCurrency } from '@/utils/formatters';
import { useAuth } from '@/contexts/AuthContext'
import type { Producto, Distribuidor,Categoria, CreateProductoDTO, UpdateProductoDTO ,Tag, UnidadMedida} from '@/types';
import type { ModalMode } from './useProductos';

// ────────────────────────────────────────────────────────────────────────────
// Convención de UnidadMedida contra el backend
// ────────────────────────────────────────────────────────────────────────────
// System.Text.Json serializa enums de C# como NÚMERO por default (0, 1).
// Si en tu Program.cs agregaste JsonStringEnumConverter, poné esto en true.
const ES_ENUM_STRING = false;
const UNIDAD: UnidadMedida     = ES_ENUM_STRING ? 'Unidad'    : 0;
const KILOGRAMO: UnidadMedida  = ES_ENUM_STRING ? 'Kilogramo' : 1;
const esKilogramo = (u: UnidadMedida) => u === 'Kilogramo' || u === 1;

// ────────────────────────────────────────────────────────────────────────────
// TYPES
// ────────────────────────────────────────────────────────────────────────────

interface ProductoModalProps {
  mode: ModalMode;
  producto: Producto | null;
  categorias: Categoria[];
  isSaving: boolean;
  saveError: string | null;
  tags: Tag[];
  distribuidores: Distribuidor[];

  onClose: () => void;
  onSave: (data: CreateProductoDTO | UpdateProductoDTO) => void;


}

interface FormState {
  nombre: string;
  codigoBarras: string;
  precioCosto: string;
  precioVenta: string;
  unidadMedida: UnidadMedida;
  stock: string;
  stockMinimo: string;
  categoriaId: string;
  fechaVencimiento: string;
  distribuidorId: string;  
  suelto: boolean;     
  tagIds: number[];
}

const FORM_INICIAL: FormState = {
  nombre: '',
  codigoBarras: '',
  precioCosto: '',
  precioVenta: '',
  unidadMedida: UNIDAD,
  stock: '',
  stockMinimo: '10',
  categoriaId: '',
  fechaVencimiento: '',
  distribuidorId: '',
  suelto: false,
  tagIds: [],

};

// ────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ────────────────────────────────────────────────────────────────────────────

export const ProductoModal: React.FC<ProductoModalProps> = ({
  mode,
  producto,
  categorias,
  distribuidores,
  isSaving,
  tags,
  saveError,
  onClose,
  onSave,
}) => {
  const [form, setForm] = useState<FormState>(FORM_INICIAL);
  const [errores, setErrores] = useState<Partial<FormState>>({});
  const porKilo = esKilogramo(form.unidadMedida);

  useEffect(() => {
  if (mode === 'editar' && producto) {
    setForm({
      nombre: producto.nombre,
      codigoBarras: producto.codigoBarra || '',
      precioCosto: String(producto.precioCosto),
      precioVenta: String(producto.precioVenta),
      unidadMedida: producto.unidadMedida ?? UNIDAD,
      stock: String(producto.stockActual),
      stockMinimo: String(producto.stockMinimo),
      categoriaId: String(producto.categoriaId),
      distribuidorId: producto.distribuidorId ? String(producto.distribuidorId) : '', // ← cambio
      suelto: producto.suelto ?? false, 
      tagIds: producto.tags?.map(t => t.tagId) ?? [],
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

  // Toggle de un tag
  const toggleTag = (tagId: number) => {
    setForm(prev => ({
      ...prev,
      tagIds: prev.tagIds.includes(tagId)
        ? prev.tagIds.filter(id => id !== tagId)
        : [...prev.tagIds, tagId],
    }));
  };

  // Unidad / Por kilo son mutuamente excluyentes con "Suelto"
  // (uno cuenta unidades enteras pedidas a mano, el otro pesa) — al elegir
  // "Por kilo" apagamos "suelto" si estaba prendido.
  const seleccionarUnidadMedida = (u: UnidadMedida) => {
    setForm(prev => ({ ...prev, unidadMedida: u, suelto: esKilogramo(u) ? false : prev.suelto }));
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
  unidadMedida: form.unidadMedida,
  tagIds: form.tagIds,
  stockActual: Number(form.stock),
  stockMinimo: Number(form.stockMinimo),
  categoriaId: Number(form.categoriaId),
  distribuidorId: form.distribuidorId ? Number(form.distribuidorId) : undefined, // ← cambio
  fechaVencimiento: form.fechaVencimiento || undefined,
  suelto: form.suelto,
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

        {/* Unidad de medida: por unidad o por kilo */}
        <div>
          <label className="input-label mb-1 block">Se vende</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => seleccionarUnidadMedida(UNIDAD)}
              className={`py-2 rounded-lg text-sm font-semibold border-2 transition-all ${
                !porKilo
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-neutral-200 text-neutral-500 hover:border-neutral-300'
              }`}
            >
              Por unidad
            </button>
            <button
              type="button"
              onClick={() => seleccionarUnidadMedida(KILOGRAMO)}
              className={`py-2 rounded-lg text-sm font-semibold border-2 transition-all ${
                porKilo
                  ? 'border-amber-500 bg-amber-50 text-amber-700'
                  : 'border-neutral-200 text-neutral-500 hover:border-neutral-300'
              }`}
            >
              Por kilo (fiambre, pan, etc.)
            </button>
          </div>
        </div>

        {/* Precios */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Input
              label={porKilo ? 'Precio de costo (por kilo)' : 'Precio de costo'}
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
              label={porKilo ? 'Precio de venta (por kilo)' : 'Precio de venta'}
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
                {porKilo ? ' kilo' : ' unidad'})
              </span>
            )}
          </div>
        )}

        {/* Stock */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label={porKilo ? 'Stock actual (gramos)' : 'Stock actual'}
            type="number"
            min="0"
            step="1"
            placeholder="0"
            value={form.stock}
            onChange={(e) => handleChange('stock', e.target.value)}
            error={errores.stock}
            helperText={porKilo ? 'Cargá el peso en gramos (ej: 8000 = 8kg)' : undefined}
            required
          />
          <Input
            label={porKilo ? 'Stock mínimo (gramos)' : 'Stock mínimo'}
            type="number"
            min="0"
            step="1"
            placeholder={porKilo ? '500' : '10'}
            value={form.stockMinimo}
            onChange={(e) => handleChange('stockMinimo', e.target.value)}
            error={errores.stockMinimo}
            helperText={porKilo ? 'En gramos — umbral para alerta de stock bajo' : 'Umbral para alertas de stock bajo'}
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


        {/* Producto suelto (no aplica a productos por kilo: ahí ya se pide el peso) */}
        {!porKilo && (
          <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg border border-neutral-200">
            <div>
              <p className="text-sm font-medium text-neutral-700">Producto suelto</p>
              <p className="text-xs text-neutral-400">Al venderlo pedirá la cantidad (caramelos, cigarrillos, etc.)</p>
            </div>
            <button
              type="button"
              onClick={() => setForm(prev => ({ ...prev, suelto: !prev.suelto }))}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                form.suelto ? 'bg-green-500' : 'bg-neutral-300'
              }`}
            >
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                form.suelto ? 'translate-x-5' : 'translate-x-0.5'
              }`} />
            </button>
          </div>
        )}


{/* Tags */}
<div>
  <label className="input-label mb-1 block">Tags</label>
  <div className="flex flex-wrap gap-2">
    {tags.filter(t => t.activo).map(t => {
      const sel = form.tagIds.includes(t.tagId);
      return (
        <button
          key={t.tagId}
          type="button"
          onClick={() => toggleTag(t.tagId)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
            sel
              ? 'bg-primary text-white border-primary'
              : 'bg-white text-neutral-600 border-neutral-300 hover:border-primary/50'
          }`}
        >
          {t.nombre}
        </button>
      );
    })}
    {tags.length === 0 && (
      <p className="text-xs text-neutral-400">No hay tags creados todavía</p>
    )}
  </div>
</div>



         <select
          value={form.distribuidorId}
          onChange={e => handleChange('distribuidorId', e.target.value)}
          className="px-3 py-2 border border-neutral-300 rounded-lg text-sm w-full focus:outline-none focus:border-primary"
        >
          <option value="">Sin distribuidor</option>
          {distribuidores.filter((d: Distribuidor) => d.activo).map((d: Distribuidor) => (
            <option key={d.distribuidorId} value={d.distribuidorId}>{d.nombre}</option>
          ))}
        </select>

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