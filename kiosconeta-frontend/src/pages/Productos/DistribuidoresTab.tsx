// ════════════════════════════════════════════════════════════════════════════
// COMPONENT: DistribuidoresTab — ABM de distribuidores dentro de Productos
// ════════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect, useCallback } from 'react';
import {
  Truck, Plus, Trash2, ToggleLeft, ToggleRight,
  AlertTriangle, RefreshCw, X, Phone, Mail,
  FileText, Loader2, Package,
} from 'lucide-react';
import { Button, Modal } from '@/components/commons';
import { useAuth } from '@/contexts/AuthContext';
import { distribuidoresApi } from '@/apis/distribuidoresApi';
import type { Distribuidor, CreateDistribuidorDTO } from '@/types';

// ────────────────────────────────────────────────────────────────────────────
// TIPOS
// ────────────────────────────────────────────────────────────────────────────

type FormState = {
  nombre: string;
  telefono: string;
  email: string;
  notas: string;
};

const FORM_INICIAL: FormState = {
  nombre: '',
  telefono: '',
  email: '',
  notas: '',
};

// ────────────────────────────────────────────────────────────────────────────
// FORM MODAL
// ────────────────────────────────────────────────────────────────────────────

const DistribuidorForm: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (dto: CreateDistribuidorDTO) => Promise<void>;
  isSaving: boolean;
  saveError: string;
}> = ({ isOpen, onClose, onSave, isSaving, saveError }) => {

  const [form, setForm] = useState<FormState>(FORM_INICIAL);
  const [errors, setErrors] = useState<Partial<FormState>>({});

  const set = <K extends keyof FormState>(key: K, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setErrors(prev => ({ ...prev, [key]: undefined }));
  };

  useEffect(() => {
    if (isOpen) { setForm(FORM_INICIAL); setErrors({}); }
  }, [isOpen]);

  const validar = (): boolean => {
    const e: Partial<FormState> = {};
    if (!form.nombre.trim()) e.nombre = 'El nombre es obligatorio';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = 'El email no es válido';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validar()) return;
    await onSave({
      nombre:   form.nombre.trim(),
      telefono: form.telefono.trim() || undefined,
      email:    form.email.trim()    || undefined,
      notas:    form.notas.trim()    || undefined,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Nuevo distribuidor"
      size="md"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>Cancelar</Button>
          <Button variant="primary" onClick={handleSubmit} loading={isSaving}>
            Guardar distribuidor
          </Button>
        </>
      }
    >
      <div className="space-y-4">

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
            placeholder="Ej: Coca Cola S.A., Distribuidora Norte..."
            autoFocus
            className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
              ${errors.nombre ? 'border-red-400' : 'border-neutral-300'}`}
          />
          {errors.nombre && <p className="text-xs text-red-500 mt-1">{errors.nombre}</p>}
        </div>

        {/* Teléfono */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Teléfono <span className="text-neutral-400 font-normal text-xs">(opcional)</span>
          </label>
          <div className="relative">
            <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
            <input
              type="text"
              value={form.telefono}
              onChange={e => set('telefono', e.target.value)}
              placeholder="Ej: 011-4444-5555"
              className="w-full pl-9 pr-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Email <span className="text-neutral-400 font-normal text-xs">(opcional)</span>
          </label>
          <div className="relative">
            <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
            <input
              type="email"
              value={form.email}
              onChange={e => set('email', e.target.value)}
              placeholder="Ej: ventas@distribuidora.com"
              className={`w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
                ${errors.email ? 'border-red-400' : 'border-neutral-300'}`}
            />
          </div>
          {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
        </div>

        {/* Notas */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Notas <span className="text-neutral-400 font-normal text-xs">(opcional)</span>
          </label>
          <div className="relative">
            <FileText size={14} className="absolute left-3 top-3 text-neutral-400 pointer-events-none" />
            <textarea
              value={form.notas}
              onChange={e => set('notas', e.target.value)}
              placeholder="Días de entrega, condiciones de pago, contacto..."
              rows={3}
              className="w-full pl-9 pr-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none"
            />
          </div>
        </div>

      </div>
    </Modal>
  );
};

// ────────────────────────────────────────────────────────────────────────────
// TARJETA DE DISTRIBUIDOR
// ────────────────────────────────────────────────────────────────────────────

const DistribuidorCard: React.FC<{
  distribuidor: Distribuidor;
  onToggle: () => void;
  onDelete: () => void;
  isToggling: boolean;
}> = ({ distribuidor, onToggle, onDelete, isToggling }) => (
  <div className={`bg-white rounded-xl border-2 p-4 flex flex-col gap-3 transition-all
    ${distribuidor.activo ? 'border-neutral-200 shadow-sm' : 'border-neutral-100 opacity-60'}`}>

    {/* Header */}
    <div className="flex items-start justify-between gap-2">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <Truck size={18} className="text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-neutral-900 text-sm leading-tight truncate">
            {distribuidor.nombre}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full
              ${distribuidor.activo ? 'bg-success-50 text-success-700' : 'bg-neutral-100 text-neutral-500'}`}>
              {distribuidor.activo ? 'Activo' : 'Inactivo'}
            </span>
            {distribuidor.cantidadProductos > 0 && (
              <span className="text-[10px] text-neutral-400 flex items-center gap-0.5">
                <Package size={10} />
                {distribuidor.cantidadProductos} producto{distribuidor.cantidadProductos !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>

    {/* Detalle */}
    <div className="space-y-1.5">
      {distribuidor.telefono && (
        <div className="flex items-center gap-2 text-xs text-neutral-500">
          <Phone size={11} className="text-neutral-400 shrink-0" />
          <span>{distribuidor.telefono}</span>
        </div>
      )}
      {distribuidor.email && (
        <div className="flex items-center gap-2 text-xs text-neutral-500">
          <Mail size={11} className="text-neutral-400 shrink-0" />
          <span className="truncate">{distribuidor.email}</span>
        </div>
      )}
      {distribuidor.notas && (
        <div className="flex items-start gap-2 text-xs text-neutral-500">
          <FileText size={11} className="text-neutral-400 shrink-0 mt-0.5" />
          <span className="line-clamp-2">{distribuidor.notas}</span>
        </div>
      )}
    </div>

    {/* Acciones */}
    <div className="flex items-center gap-2 pt-2 border-t border-neutral-100">
      <button
        onClick={onToggle}
        disabled={isToggling}
        className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all
          ${distribuidor.activo
            ? 'text-neutral-500 hover:bg-neutral-100'
            : 'text-success-700 hover:bg-success-50'}`}
      >
        {isToggling
          ? <Loader2 size={13} className="animate-spin" />
          : distribuidor.activo ? <ToggleLeft size={13} /> : <ToggleRight size={13} />
        }
        {distribuidor.activo ? 'Desactivar' : 'Activar'}
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

// ────────────────────────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL: DistribuidoresTab
// ────────────────────────────────────────────────────────────────────────────

export const DistribuidoresTab: React.FC = () => {
  const { user } = useAuth();

  const [distribuidores, setDistribuidores] = useState<Distribuidor[]>([]);
  const [isLoading, setIsLoading]           = useState(true);
  const [error, setError]                   = useState<string | null>(null);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [isSaving, setIsSaving]         = useState(false);
  const [saveError, setSaveError]       = useState('');

  const [togglingId, setTogglingId]               = useState<number | null>(null);
  const [deletingId, setDeletingId]               = useState<number | null>(null);
  const [distribuidorAEliminar, setDistribuidorAEliminar] = useState<Distribuidor | null>(null);

  // ── Cargar ───────────────────────────────────────────────────────────────
  const cargar = useCallback(async () => {
    if (!user?.kioscoId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await distribuidoresApi.getByKiosco(user.kioscoId);
      setDistribuidores(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar los distribuidores');
    } finally {
      setIsLoading(false);
    }
  }, [user?.kioscoId]);

  useEffect(() => { cargar(); }, [cargar]);

  // ── Crear ────────────────────────────────────────────────────────────────
  const handleSave = async (dto: CreateDistribuidorDTO) => {
    if (!user?.kioscoId) return;
    setIsSaving(true);
    setSaveError('');
    try {
      const nuevo = await distribuidoresApi.create(user.kioscoId, dto);
      setDistribuidores(prev => [nuevo, ...prev]);
      setModalAbierto(false);
    } catch (err: any) {
      setSaveError(err.message || 'Error al crear el distribuidor');
    } finally {
      setIsSaving(false);
    }
  };

  // ── Toggle activo ─────────────────────────────────────────────────────────
  const handleToggle = async (distribuidor: Distribuidor) => {
    setTogglingId(distribuidor.distribuidorId);
    try {
      await distribuidoresApi.update(distribuidor.distribuidorId, {
        nombre:   distribuidor.nombre,
        telefono: distribuidor.telefono,
        email:    distribuidor.email,
        notas:    distribuidor.notas,
        activo:   !distribuidor.activo,
      });
      setDistribuidores(prev =>
        prev.map(d =>
          d.distribuidorId === distribuidor.distribuidorId
            ? { ...d, activo: !d.activo }
            : d
        )
      );
    } catch (err: any) {
      setError(err.message || 'Error al cambiar el estado');
    } finally {
      setTogglingId(null);
    }
  };

  // ── Eliminar ──────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!distribuidorAEliminar) return;
    setDeletingId(distribuidorAEliminar.distribuidorId);
    try {
      await distribuidoresApi.delete(distribuidorAEliminar.distribuidorId);
      setDistribuidores(prev =>
        prev.filter(d => d.distribuidorId !== distribuidorAEliminar.distribuidorId)
      );
      setDistribuidorAEliminar(null);
    } catch (err: any) {
      setError(err.message || 'Error al eliminar el distribuidor');
      setDistribuidorAEliminar(null);
    } finally {
      setDeletingId(null);
    }
  };

  // ── Stats ──────────────────────────────────────────────────────────────────
  const activos   = distribuidores.filter(d => d.activo).length;
  const inactivos = distribuidores.filter(d => !d.activo).length;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
            <Truck size={18} className="text-primary" /> Distribuidores
          </h2>
          <p className="text-sm text-neutral-500 mt-0.5">
            Gestioná tus proveedores y asocialos a productos
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" leftIcon={<RefreshCw size={14} />} onClick={cargar}>
            Actualizar
          </Button>
          <Button variant="primary" size="sm" leftIcon={<Plus size={14} />} onClick={() => setModalAbierto(true)}>
            Nuevo distribuidor
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
      {distribuidores.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total',     value: distribuidores.length, color: 'text-neutral-600' },
            { label: 'Activos',   value: activos,               color: 'text-success-700' },
            { label: 'Inactivos', value: inactivos,             color: 'text-neutral-500' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-neutral-200 p-4 text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
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
      {!isLoading && distribuidores.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
            <Truck size={32} className="text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-neutral-800 mb-2">Sin distribuidores todavía</h3>
          <p className="text-sm text-neutral-500 mb-6 max-w-xs">
            Agregá tus proveedores para asociarlos a los productos y tener un mejor control de compras.
          </p>
          <Button variant="primary" leftIcon={<Plus size={15} />} onClick={() => setModalAbierto(true)}>
            Agregar primer distribuidor
          </Button>
        </div>
      )}

      {/* Grid */}
      {!isLoading && distribuidores.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {distribuidores.map(d => (
            <DistribuidorCard
              key={d.distribuidorId}
              distribuidor={d}
              onToggle={() => handleToggle(d)}
              onDelete={() => setDistribuidorAEliminar(d)}
              isToggling={togglingId === d.distribuidorId}
            />
          ))}
        </div>
      )}

      {/* Modal crear */}
      <DistribuidorForm
        isOpen={modalAbierto}
        onClose={() => { setModalAbierto(false); setSaveError(''); }}
        onSave={handleSave}
        isSaving={isSaving}
        saveError={saveError}
      />

      {/* Modal confirmar eliminar */}
      <Modal
        isOpen={!!distribuidorAEliminar}
        onClose={() => setDistribuidorAEliminar(null)}
        title="Eliminar distribuidor"
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setDistribuidorAEliminar(null)} disabled={!!deletingId}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleDelete} loading={!!deletingId}>
              Sí, eliminar
            </Button>
          </>
        }
      >
        <p className="text-neutral-700">
          ¿Eliminás el distribuidor <strong>{distribuidorAEliminar?.nombre}</strong>?
        </p>
        <p className="text-sm text-neutral-500 mt-2">
          {distribuidorAEliminar?.cantidadProductos
            ? `Tiene ${distribuidorAEliminar.cantidadProductos} producto${distribuidorAEliminar.cantidadProductos !== 1 ? 's' : ''} asociado${distribuidorAEliminar.cantidadProductos !== 1 ? 's' : ''}. Si lo eliminás, esos productos quedarán sin distribuidor.`
            : 'Esta acción no se puede deshacer. Si solo querés pausarlo, usá el botón "Desactivar".'
          }
        </p>
      </Modal>

    </div>
  );
};

export default DistribuidoresTab;