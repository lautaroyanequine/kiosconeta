// ════════════════════════════════════════════════════════════════════════════
// COMPONENT: PromocionesTab — ABM de promociones dentro de Productos
// Tipos soportados: 1=Combo | 2=Cantidad (Nx1) | 3=Porcentaje
// ════════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect, useCallback } from 'react';
import {
  Tag, Plus, Trash2, ToggleLeft, ToggleRight,
  AlertTriangle, RefreshCw, X, Package, Percent,
  ShoppingBag, Hash, Calendar, ChevronDown, Loader2,
} from 'lucide-react';
import { Button, Badge, Modal } from '@/components/commons';
import { useAuth } from '@/contexts/AuthContext';
import { promocionesApi } from '@/apis/promocionesApi';
import { formatCurrency, formatDate } from '@/utils/formatters';
import type {
  PromocionResponseDTO,
  CreatePromocionDTO,
  TipoPromocion,
} from '@/apis/promocionesApi';
import type { Producto } from '@/types';

// ────────────────────────────────────────────────────────────────────────────
// TIPOS LOCALES
// ────────────────────────────────────────────────────────────────────────────

interface PromocionesTabProps {
  /** Lista de productos del kiosco, para los selects del formulario */
  productos: Producto[];
}

type FormState = {
  nombre: string;
  descripcion: string;
  tipo: TipoPromocion;
  fechaDesde: string;
  fechaHasta: string;
  // Combo
  precioCombo: string;
  productosCombo: { productoId: number; cantidad: number }[];
  // Cantidad
  cantidadRequerida: string;
  cantidadPaga: string;
  productoIdCantidad: number | '';
  // Porcentaje
  porcentajeDescuento: string;
  productoIdPorcentaje: number | '';
  categoriaIdPorcentaje: number | '';
  cantidadMinimaDescuento: string;
};

const FORM_INICIAL: FormState = {
  nombre: '',
  descripcion: '',
  tipo: 1,
  fechaDesde: '',
  fechaHasta: '',
  precioCombo: '',
  productosCombo: [],
  cantidadRequerida: '',
  cantidadPaga: '',
  productoIdCantidad: '',
  porcentajeDescuento: '',
  productoIdPorcentaje: '',
  categoriaIdPorcentaje: '',
  cantidadMinimaDescuento: '',
};

// ────────────────────────────────────────────────────────────────────────────
// HELPERS
// ────────────────────────────────────────────────────────────────────────────

const TIPO_INFO: Record<TipoPromocion, { label: string; icon: React.ReactNode; color: string; desc: string }> = {
  1: { label: 'Combo',      icon: <ShoppingBag size={15} />, color: 'text-blue-600 bg-blue-50 border-blue-200',    desc: 'Varios productos juntos a un precio especial' },
  2: { label: 'Cantidad',   icon: <Hash size={15} />,        color: 'text-purple-600 bg-purple-50 border-purple-200', desc: 'Llevá N pagá menos (ej: 3x2, 4x3)' },
  3: { label: 'Porcentaje', icon: <Percent size={15} />,     color: 'text-orange-600 bg-orange-50 border-orange-200', desc: 'Descuento % en un producto o categoría' },
};

const getBadgePromo = (tipo: TipoPromocion) => {
  const info = TIPO_INFO[tipo];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${info.color}`}>
      {info.icon} {info.label}
    </span>
  );
};

// ────────────────────────────────────────────────────────────────────────────
// FORM MODAL
// ────────────────────────────────────────────────────────────────────────────

const PromocionForm: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (dto: CreatePromocionDTO) => Promise<void>;
  isSaving: boolean;
  saveError: string;
  productos: Producto[];
}> = ({ isOpen, onClose, onSave, isSaving, saveError, productos }) => {

  const [form, setForm] = useState<FormState>(FORM_INICIAL);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState | 'combo', string>>>({});

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setErrors(prev => ({ ...prev, [key]: undefined }));
  };

  // Reset al abrir
  useEffect(() => {
    if (isOpen) { setForm(FORM_INICIAL); setErrors({}); }
  }, [isOpen]);

  // ── Agregar producto al combo ─────────────────────────────────────────────
  const agregarProductoCombo = () => {
    setForm(prev => ({
      ...prev,
      productosCombo: [...prev.productosCombo, { productoId: 0, cantidad: 1 }],
    }));
  };

  const actualizarProductoCombo = (idx: number, campo: 'productoId' | 'cantidad', valor: number) => {
    setForm(prev => ({
      ...prev,
      productosCombo: prev.productosCombo.map((p, i) =>
        i === idx ? { ...p, [campo]: valor } : p
      ),
    }));
    setErrors(prev => ({ ...prev, combo: undefined }));
  };

  const quitarProductoCombo = (idx: number) => {
    setForm(prev => ({
      ...prev,
      productosCombo: prev.productosCombo.filter((_, i) => i !== idx),
    }));
  };

  // ── Validar ───────────────────────────────────────────────────────────────
  const validar = (): boolean => {
    const e: typeof errors = {};
    if (!form.nombre.trim()) e.nombre = 'El nombre es obligatorio';

    if (form.tipo === 1) {
      if (!form.precioCombo || isNaN(Number(form.precioCombo)) || Number(form.precioCombo) <= 0)
        e.precioCombo = 'Ingresá un precio válido';
      if (form.productosCombo.length < 2)
        e.combo = 'Un combo necesita al menos 2 productos';
      else if (form.productosCombo.some(p => !p.productoId || p.cantidad < 1))
        e.combo = 'Completá todos los productos del combo';
    }

    if (form.tipo === 2) {
      if (!form.productoIdCantidad) e.productoIdCantidad = 'Seleccioná un producto';
      if (!form.cantidadRequerida || Number(form.cantidadRequerida) < 2)
        e.cantidadRequerida = 'Debe ser al menos 2';
      if (!form.cantidadPaga || Number(form.cantidadPaga) < 1)
        e.cantidadPaga = 'Debe ser al menos 1';
      if (Number(form.cantidadPaga) >= Number(form.cantidadRequerida))
        e.cantidadPaga = 'Debe ser menor a la cantidad requerida';
    }

    if (form.tipo === 3) {
      if (!form.productoIdPorcentaje && !form.categoriaIdPorcentaje)
        e.productoIdPorcentaje = 'Seleccioná un producto o categoría';
      if (!form.porcentajeDescuento || Number(form.porcentajeDescuento) <= 0 || Number(form.porcentajeDescuento) > 100)
        e.porcentajeDescuento = 'Ingresá un porcentaje entre 1 y 100';
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validar()) return;

    const base: CreatePromocionDTO = {
      nombre:      form.nombre.trim(),
      descripcion: form.descripcion.trim() || undefined,
      tipo:        form.tipo,
      fechaDesde:  form.fechaDesde || undefined,
      fechaHasta:  form.fechaHasta || undefined,
    };

    if (form.tipo === 1) {
      Object.assign(base, {
        precioCombo: Number(form.precioCombo),
        productos:   form.productosCombo,
      });
    }
    if (form.tipo === 2) {
      Object.assign(base, {
        productoIdCantidad:  Number(form.productoIdCantidad),
        cantidadRequerida:   Number(form.cantidadRequerida),
        cantidadPaga:        Number(form.cantidadPaga),
      });
    }
    if (form.tipo === 3) {
      Object.assign(base, {
        porcentajeDescuento:     Number(form.porcentajeDescuento),
        productoIdPorcentaje:    form.productoIdPorcentaje  ? Number(form.productoIdPorcentaje)  : undefined,
        categoriaIdPorcentaje:   form.categoriaIdPorcentaje ? Number(form.categoriaIdPorcentaje) : undefined,
        cantidadMinimaDescuento: form.cantidadMinimaDescuento ? Number(form.cantidadMinimaDescuento) : undefined,
      });
    }

    await onSave(base);
  };

  // ── Categorías únicas ─────────────────────────────────────────────────────
  const categorias = [...new Map(
    productos.filter(p => p.categoriaId && p.categoriaNombre)
      .map(p => [p.categoriaId, { id: p.categoriaId!, nombre: p.categoriaNombre! }])
  ).values()];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Nueva promoción"
      size="md"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>Cancelar</Button>
          <Button variant="primary" onClick={handleSubmit} loading={isSaving}>
            Guardar promoción
          </Button>
        </>
      }
    >
      <div className="space-y-5">

        {/* Error de API */}
        {saveError && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            <AlertTriangle size={15} /> {saveError}
          </div>
        )}

        {/* Nombre */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Nombre <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.nombre}
            onChange={e => set('nombre', e.target.value)}
            placeholder="Ej: Combo desayuno, 3x2 alfajores..."
            className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary ${errors.nombre ? 'border-red-400' : 'border-neutral-300'}`}
          />
          {errors.nombre && <p className="text-xs text-red-500 mt-1">{errors.nombre}</p>}
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">Descripción</label>
          <input
            type="text"
            value={form.descripcion}
            onChange={e => set('descripcion', e.target.value)}
            placeholder="Texto que verá el cajero en el POS (opcional)"
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>

        {/* Tipo */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Tipo de promoción <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {([1, 2, 3] as TipoPromocion[]).map(t => {
              const info = TIPO_INFO[t];
              const sel  = form.tipo === t;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => set('tipo', t)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-center transition-all
                    ${sel ? 'border-primary bg-primary/5' : 'border-neutral-200 hover:border-neutral-300'}`}
                >
                  <span className={sel ? 'text-primary' : 'text-neutral-400'}>{info.icon}</span>
                  <span className={`text-xs font-semibold ${sel ? 'text-primary' : 'text-neutral-700'}`}>{info.label}</span>
                  <span className="text-[10px] text-neutral-400 leading-tight">{info.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── COMBO ─────────────────────────────────────────────────────── */}
        {form.tipo === 1 && (
          <div className="space-y-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="text-sm font-semibold text-blue-700 flex items-center gap-2">
              <ShoppingBag size={14} /> Configuración del Combo
            </p>

            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">
                Precio del combo <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">$</span>
                <input
                  type="number" min="0" step="0.01"
                  value={form.precioCombo}
                  onChange={e => set('precioCombo', e.target.value)}
                  placeholder="0.00"
                  className={`w-full pl-7 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-primary ${errors.precioCombo ? 'border-red-400' : 'border-neutral-300'}`}
                />
              </div>
              {errors.precioCombo && <p className="text-xs text-red-500 mt-1">{errors.precioCombo}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-neutral-600">
                  Productos del combo <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={agregarProductoCombo}
                  className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium"
                >
                  <Plus size={12} /> Agregar producto
                </button>
              </div>

              {form.productosCombo.length === 0 && (
                <p className="text-xs text-neutral-400 text-center py-3">
                  Agregá al menos 2 productos al combo
                </p>
              )}

              <div className="space-y-2">
                {form.productosCombo.map((pc, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-white rounded-lg border border-blue-100 px-3 py-2">
                    {/* Nombre del producto — ocupa todo el espacio */}
                    <div className="relative flex-1 min-w-0">
                      <select
                        value={pc.productoId || ''}
                        onChange={e => actualizarProductoCombo(idx, 'productoId', Number(e.target.value))}
                        className="w-full appearance-none bg-transparent border-none text-sm font-semibold text-neutral-800 focus:outline-none pr-5 truncate"
                      >
                        <option value="">Seleccionar producto...</option>
                        {productos.map(p => (
                          <option key={p.productoId} value={p.productoId}>{p.nombre}</option>
                        ))}
                      </select>
                      <ChevronDown size={12} className="absolute right-0 top-1/2 -translate-y-1/2 text-neutral-300 pointer-events-none" />
                    </div>
                    {/* Cantidad — chica, al costado */}
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-[10px] text-neutral-400">×</span>
                      <input
                        type="number" min="1"
                        value={pc.cantidad}
                        onChange={e => actualizarProductoCombo(idx, 'cantidad', Number(e.target.value))}
                        className="w-10 text-center text-sm font-bold text-blue-600 border border-blue-200 rounded-md py-0.5 focus:outline-none focus:border-blue-400 bg-blue-50"
                        title="Cantidad"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => quitarProductoCombo(idx)}
                      className="text-neutral-200 hover:text-red-400 transition-colors shrink-0 ml-1"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
              {errors.combo && <p className="text-xs text-red-500 mt-1">{errors.combo}</p>}
            </div>
          </div>
        )}

        {/* ── CANTIDAD (Nx1) ─────────────────────────────────────────────── */}
        {form.tipo === 2 && (
          <div className="space-y-3 p-4 bg-purple-50 border border-purple-200 rounded-xl">
            <p className="text-sm font-semibold text-purple-700 flex items-center gap-2">
              <Hash size={14} /> Configuración Llevá N / Pagá menos
            </p>

            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">
                Producto <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={form.productoIdCantidad}
                  onChange={e => set('productoIdCantidad', e.target.value ? Number(e.target.value) : '')}
                  className={`w-full appearance-none px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-primary bg-white pr-8 ${errors.productoIdCantidad ? 'border-red-400' : 'border-neutral-300'}`}
                >
                  <option value="">Seleccionar producto...</option>
                  {productos.map(p => (
                    <option key={p.productoId} value={p.productoId}>{p.nombre}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
              </div>
              {errors.productoIdCantidad && <p className="text-xs text-red-500 mt-1">{errors.productoIdCantidad}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">
                  Lleva (cantidad) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number" min="2"
                  value={form.cantidadRequerida}
                  onChange={e => set('cantidadRequerida', e.target.value)}
                  placeholder="Ej: 3"
                  className={`w-full px-3 py-2 border rounded-lg text-sm text-center focus:outline-none focus:border-primary ${errors.cantidadRequerida ? 'border-red-400' : 'border-neutral-300'}`}
                />
                {errors.cantidadRequerida && <p className="text-xs text-red-500 mt-1">{errors.cantidadRequerida}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1">
                  Paga (cantidad) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number" min="1"
                  value={form.cantidadPaga}
                  onChange={e => set('cantidadPaga', e.target.value)}
                  placeholder="Ej: 2"
                  className={`w-full px-3 py-2 border rounded-lg text-sm text-center focus:outline-none focus:border-primary ${errors.cantidadPaga ? 'border-red-400' : 'border-neutral-300'}`}
                />
                {errors.cantidadPaga && <p className="text-xs text-red-500 mt-1">{errors.cantidadPaga}</p>}
              </div>
            </div>

            {form.cantidadRequerida && form.cantidadPaga && Number(form.cantidadPaga) < Number(form.cantidadRequerida) && (
              <div className="text-xs text-purple-600 bg-white border border-purple-200 rounded-lg px-3 py-2">
                Resumen: por cada {form.cantidadRequerida} unidades, el cliente paga {form.cantidadPaga}
                {' '}(se regala {Number(form.cantidadRequerida) - Number(form.cantidadPaga)})
              </div>
            )}
          </div>
        )}

        {/* ── PORCENTAJE ───────────────────────────────────────────────────── */}
        {form.tipo === 3 && (
          <div className="space-y-3 p-4 bg-orange-50 border border-orange-200 rounded-xl">
            <p className="text-sm font-semibold text-orange-700 flex items-center gap-2">
              <Percent size={14} /> Configuración de Descuento por Porcentaje
            </p>

            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1">
                % de descuento <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number" min="1" max="100"
                  value={form.porcentajeDescuento}
                  onChange={e => set('porcentajeDescuento', e.target.value)}
                  placeholder="Ej: 15"
                  className={`w-full pr-8 pl-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-primary ${errors.porcentajeDescuento ? 'border-red-400' : 'border-neutral-300'}`}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 text-sm">%</span>
              </div>
              {errors.porcentajeDescuento && <p className="text-xs text-red-500 mt-1">{errors.porcentajeDescuento}</p>}
            </div>

            <p className="text-xs font-medium text-neutral-600">Aplicar a:</p>

            <div>
              <label className="block text-xs text-neutral-500 mb-1">Producto específico</label>
              <div className="relative">
                <select
                  value={form.productoIdPorcentaje}
                  onChange={e => {
                    set('productoIdPorcentaje', e.target.value ? Number(e.target.value) : '');
                    if (e.target.value) set('categoriaIdPorcentaje', '');
                    setErrors(prev => ({ ...prev, productoIdPorcentaje: undefined }));
                  }}
                  className="w-full appearance-none px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:border-primary bg-white pr-8"
                >
                  <option value="">Ninguno</option>
                  {productos.map(p => (
                    <option key={p.productoId} value={p.productoId}>{p.nombre}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
              </div>
            </div>

            {categorias.length > 0 && (
              <div>
                <label className="block text-xs text-neutral-500 mb-1">
                  O categoría completa
                </label>
                <div className="relative">
                  <select
                    value={form.categoriaIdPorcentaje}
                    onChange={e => {
                      set('categoriaIdPorcentaje', e.target.value ? Number(e.target.value) : '');
                      if (e.target.value) set('productoIdPorcentaje', '');
                      setErrors(prev => ({ ...prev, productoIdPorcentaje: undefined }));
                    }}
                    className="w-full appearance-none px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:border-primary bg-white pr-8"
                  >
                    <option value="">Ninguna</option>
                    {categorias.map(c => (
                      <option key={c.id} value={c.id}>{c.nombre}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                </div>
              </div>
            )}

            {errors.productoIdPorcentaje && (
              <p className="text-xs text-red-500">{errors.productoIdPorcentaje}</p>
            )}

            {/* Cantidad mínima para precio por volumen */}
            {form.productoIdPorcentaje !== '' && (
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 space-y-2">
                <p className="text-xs font-semibold text-orange-700 flex items-center gap-1.5">
                  <Hash size={12} /> Precio por volumen <span className="font-normal text-orange-400">(opcional)</span>
                </p>
                <label className="block text-xs text-neutral-600">
                  ¿A partir de cuántas unidades aplicar el descuento?
                </label>
                <input
                  type="number" min="2"
                  value={form.cantidadMinimaDescuento}
                  onChange={e => set('cantidadMinimaDescuento', e.target.value)}
                  placeholder="Ej: 3 → si lleva 3 o más, se aplica el % de arriba"
                  className="w-full px-3 py-2 border border-orange-200 bg-white rounded-lg text-sm focus:outline-none focus:border-orange-400"
                />
                {form.cantidadMinimaDescuento && Number(form.cantidadMinimaDescuento) >= 2 && form.porcentajeDescuento && (
                  <p className="text-xs text-orange-700 font-medium bg-orange-100 rounded-lg px-3 py-2">
                    ✓ Si lleva {form.cantidadMinimaDescuento} o más → {form.porcentajeDescuento}% off en todas las unidades
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Fechas de vigencia (opcionales) */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2 flex items-center gap-1.5">
            <Calendar size={14} /> Vigencia <span className="text-neutral-400 font-normal text-xs">(opcional)</span>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Desde</label>
              <input
                type="date"
                value={form.fechaDesde}
                onChange={e => set('fechaDesde', e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-xs text-neutral-500 mb-1">Hasta</label>
              <input
                type="date"
                value={form.fechaHasta}
                onChange={e => set('fechaHasta', e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:border-primary"
              />
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

// ────────────────────────────────────────────────────────────────────────────
// TARJETA DE PROMO
// ────────────────────────────────────────────────────────────────────────────

const PromoCard: React.FC<{
  promo: PromocionResponseDTO;
  onToggle: () => void;
  onDelete: () => void;
  isToggling: boolean;
}> = ({ promo, onToggle, onDelete, isToggling }) => {

  const renderDetalle = () => {
    if (promo.tipo === 1 && promo.productos?.length) {
      const sum = promo.productos.reduce((s, p) => s + p.precioUnitario * p.cantidad, 0);
      return (
        <div className="space-y-1.5">
          {promo.productos.map((p, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-neutral-600">
              <Package size={11} className="text-neutral-400 shrink-0" />
              <span className="flex-1 truncate">{p.productoNombre}</span>
              <span className="text-neutral-400">×{p.cantidad}</span>
            </div>
          ))}
          {promo.precioCombo != null && (
            <div className="pt-1.5 border-t border-neutral-100 flex justify-between text-xs">
              <span className="text-neutral-400 line-through">{formatCurrency(sum)}</span>
              <span className="font-bold text-blue-600">{formatCurrency(promo.precioCombo)}</span>
            </div>
          )}
        </div>
      );
    }
    if (promo.tipo === 2) {
      return (
        <div className="text-xs text-neutral-600 space-y-1">
          <p className="font-medium text-neutral-800 truncate">{promo.productoNombreCantidad}</p>
          <p className="text-purple-600 font-semibold">
            Llevá {promo.cantidadRequerida} → Pagá {promo.cantidadPaga}
          </p>
        </div>
      );
    }
    if (promo.tipo === 3) {
      return (
        <div className="text-xs text-neutral-600 space-y-1">
          <p className="text-2xl font-black text-orange-500 leading-none">
            -{promo.porcentajeDescuento}%
          </p>
          {promo.productoNombrePorcentaje && (
            <p className="truncate">en {promo.productoNombrePorcentaje}</p>
          )}
          {promo.categoriaNombrePorcentaje && (
            <p className="truncate">en categoría {promo.categoriaNombrePorcentaje}</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`bg-white rounded-xl border-2 p-4 flex flex-col gap-3 transition-all
      ${promo.activa ? 'border-neutral-200 shadow-sm' : 'border-neutral-100 opacity-60'}`}>

      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          {getBadgePromo(promo.tipo)}
          <p className="font-semibold text-neutral-900 mt-1.5 text-sm leading-tight truncate">
            {promo.nombre}
          </p>
          {promo.descripcion && (
            <p className="text-xs text-neutral-400 mt-0.5 truncate">{promo.descripcion}</p>
          )}
        </div>
        <Badge variant={promo.activa ? 'success' : 'neutral'} className="shrink-0 text-xs">
          {promo.activa ? 'Activa' : 'Inactiva'}
        </Badge>
      </div>

      {/* Detalle */}
      <div className="flex-1">
        {renderDetalle()}
      </div>

      {/* Vigencia */}
      {(promo.fechaDesde || promo.fechaHasta) && (
        <div className="flex items-center gap-1 text-xs text-neutral-400">
          <Calendar size={11} />
          {promo.fechaDesde && <span>Desde {formatDate(promo.fechaDesde)}</span>}
          {promo.fechaHasta && <span>hasta {formatDate(promo.fechaHasta)}</span>}
        </div>
      )}

      {/* Acciones */}
      <div className="flex items-center gap-2 pt-2 border-t border-neutral-100">
        <button
          onClick={onToggle}
          disabled={isToggling}
          className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all
            ${promo.activa
              ? 'text-neutral-500 hover:bg-neutral-100'
              : 'text-success-700 hover:bg-success-50'}`}
        >
          {isToggling
            ? <Loader2 size={13} className="animate-spin" />
            : promo.activa ? <ToggleLeft size={13} /> : <ToggleRight size={13} />
          }
          {promo.activa ? 'Desactivar' : 'Activar'}
        </button>
        <button
          onClick={onDelete}
          className="ml-auto flex items-center gap-1 text-xs text-neutral-300 hover:text-red-500 transition-colors px-2 py-1.5 rounded-lg hover:bg-red-50"
        >
          <Trash2 size={13} /> Eliminar
        </button>
      </div>
    </div>
  );
};

// ────────────────────────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL: PromocionesTab
// ────────────────────────────────────────────────────────────────────────────

export const PromocionesTab: React.FC<PromocionesTabProps> = ({ productos }) => {
  const { user } = useAuth();

  const [promos, setPromos]       = useState<PromocionResponseDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState<string | null>(null);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [isSaving, setIsSaving]         = useState(false);
  const [saveError, setSaveError]       = useState('');

  const [togglingId, setTogglingId]     = useState<number | null>(null);
  const [deletingId, setDeletingId]     = useState<number | null>(null);
  const [promoAEliminar, setPromoAEliminar] = useState<PromocionResponseDTO | null>(null);

  // ── Cargar ───────────────────────────────────────────────────────────────
  const cargar = useCallback(async () => {
    if (!user?.kioscoId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await promocionesApi.getByKiosco(user.kioscoId);
      setPromos(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar las promociones');
    } finally {
      setIsLoading(false);
    }
  }, [user?.kioscoId]);

  useEffect(() => { cargar(); }, [cargar]);

  // ── Crear ────────────────────────────────────────────────────────────────
  const handleSave = async (dto: CreatePromocionDTO) => {
    if (!user?.kioscoId) return;
    setIsSaving(true);
    setSaveError('');
    try {
      const nueva = await promocionesApi.create(user.kioscoId, dto);
      setPromos(prev => [nueva, ...prev]);
      setModalAbierto(false);
    } catch (err: any) {
      setSaveError(err.message || 'Error al crear la promoción');
    } finally {
      setIsSaving(false);
    }
  };

  // ── Toggle activa ─────────────────────────────────────────────────────────
  const handleToggle = async (promo: PromocionResponseDTO) => {
    setTogglingId(promo.promocionId);
    try {
      await promocionesApi.toggle(promo.promocionId);
      setPromos(prev =>
        prev.map(p => p.promocionId === promo.promocionId ? { ...p, activa: !p.activa } : p)
      );
    } catch (err: any) {
      setError(err.message || 'Error al cambiar el estado');
    } finally {
      setTogglingId(null);
    }
  };

  // ── Eliminar ──────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!promoAEliminar) return;
    setDeletingId(promoAEliminar.promocionId);
    try {
      await promocionesApi.delete(promoAEliminar.promocionId);
      setPromos(prev => prev.filter(p => p.promocionId !== promoAEliminar.promocionId));
      setPromoAEliminar(null);
    } catch (err: any) {
      const status = err?.response?.status ?? err?.status;
      const mensaje = status === 403
        ? 'Sin permiso para eliminar promociones. El administrador debe asignarte el permiso "configuracion.kiosco".'
        : err.message || 'Error inesperado al eliminar la promoción';
      setError(mensaje);
      setPromoAEliminar(null);
    } finally {
      setDeletingId(null);
    }
  };

  // ── Stats ──────────────────────────────────────────────────────────────────
  const activas   = promos.filter(p => p.activa).length;
  const inactivas = promos.filter(p => !p.activa).length;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
            <Tag size={18} className="text-primary" /> Promociones
          </h2>
          <p className="text-sm text-neutral-500 mt-0.5">
            Las promos activas se detectan automáticamente en el POS
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" leftIcon={<RefreshCw size={14} />} onClick={cargar}>
            Actualizar
          </Button>
          <Button variant="primary" size="sm" leftIcon={<Plus size={14} />} onClick={() => setModalAbierto(true)}>
            Nueva promoción
          </Button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <AlertTriangle size={15} /> {error}
          <button onClick={() => setError(null)} className="ml-auto"><X size={14} /></button>
        </div>
      )}

      {/* Stats */}
      {promos.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total',    value: promos.length, color: 'bg-neutral-100 text-neutral-600' },
            { label: 'Activas',  value: activas,       color: 'bg-success-50 text-success-700' },
            { label: 'Inactivas',value: inactivas,     color: 'bg-neutral-100 text-neutral-500' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-neutral-200 p-4 text-center">
              <p className={`text-2xl font-bold ${s.color.split(' ')[1]}`}>{s.value}</p>
              <p className="text-xs text-neutral-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={28} className="animate-spin text-primary" />
        </div>
      )}

      {/* Empty state */}
      {!isLoading && promos.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
            <Tag size={32} className="text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-neutral-800 mb-2">Sin promociones todavía</h3>
          <p className="text-sm text-neutral-500 mb-6 max-w-xs">
            Creá combos, descuentos por cantidad o porcentajes que se aplican automáticamente en el POS.
          </p>
          <Button variant="primary" leftIcon={<Plus size={15} />} onClick={() => setModalAbierto(true)}>
            Crear primera promoción
          </Button>
        </div>
      )}

      {/* Grid de promos */}
      {!isLoading && promos.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {promos.map(promo => (
            <PromoCard
              key={promo.promocionId}
              promo={promo}
              onToggle={() => handleToggle(promo)}
              onDelete={() => setPromoAEliminar(promo)}
              isToggling={togglingId === promo.promocionId}
            />
          ))}
        </div>
      )}

      {/* Modal crear */}
      <PromocionForm
        isOpen={modalAbierto}
        onClose={() => { setModalAbierto(false); setSaveError(''); }}
        onSave={handleSave}
        isSaving={isSaving}
        saveError={saveError}
        productos={productos}
      />

      {/* Modal confirmar eliminar */}
      <Modal
        isOpen={!!promoAEliminar}
        onClose={() => setPromoAEliminar(null)}
        title="Eliminar promoción"
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setPromoAEliminar(null)} disabled={!!deletingId}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleDelete} loading={!!deletingId}>
              Sí, eliminar
            </Button>
          </>
        }
      >
        <p className="text-neutral-700">
          ¿Eliminás la promoción <strong>{promoAEliminar?.nombre}</strong>?
        </p>
        <p className="text-sm text-neutral-500 mt-2">
          Esta acción no se puede deshacer. Si solo querés pausarla, usá el botón "Desactivar".
        </p>
      </Modal>
    </div>
  );
};

export default PromocionesTab;