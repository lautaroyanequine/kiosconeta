// ════════════════════════════════════════════════════════════════════════════
// PAGE: Categorías — ABM completo
// ════════════════════════════════════════════════════════════════════════════

import React from 'react';
import {
  Plus,
  Search,
  RefreshCw,
  Pencil,
  Trash2,
  Tag,
  Package,
  AlertCircle,
  FolderOpen,
} from 'lucide-react';
import { Button, Input, Badge, Modal, LoadingOverlay } from '@/components/commons';
import { CategoriaModal } from './CategoriaModal';
import { useCategorias } from './useCategorias';
import type { Categoria } from '@/types';

// ────────────────────────────────────────────────────────────────────────────
// STAT CARD (mismo patrón que Productos)
// ────────────────────────────────────────────────────────────────────────────

const StatCard: React.FC<{
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}> = ({ label, value, icon, color }) => (
  <div className="bg-white rounded-xl border border-neutral-200 p-4 flex items-center gap-3">
    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-2xl font-bold text-neutral-900">{value}</p>
      <p className="text-xs text-neutral-500">{label}</p>
    </div>
  </div>
);

// ────────────────────────────────────────────────────────────────────────────
// PAGE COMPONENT
// ────────────────────────────────────────────────────────────────────────────

const CategoriasPage: React.FC = () => {
  const {
    categoriasFiltradas,
    stats,
    isLoading,
    error,
    busqueda,
    setBusqueda,
    modalMode,
    categoriaSeleccionada,
    isSaving,
    saveError,
    abrirCrear,
    abrirEditar,
    cerrarModal,
    guardar,
    categoriaAEliminar,
    isDeleting,
    deleteError,
    confirmarEliminar,
    cancelarEliminar,
    eliminar,
    cargarCategorias,
  } = useCategorias();

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="h-full flex flex-col bg-neutral-50">

      {isLoading && <LoadingOverlay message="Cargando categorías..." />}

      {/* ── Header ── */}
      <div className="bg-white border-b border-neutral-200 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-neutral-900">Categorías</h1>
            <p className="text-sm text-neutral-500 mt-0.5">
              Organizá tus productos por categoría
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<RefreshCw size={15} />}
              onClick={cargarCategorias}
              disabled={isLoading}
            >
              Actualizar
            </Button>
            <Button
              variant="primary"
              leftIcon={<Plus size={16} />}
              onClick={abrirCrear}
            >
              Nueva categoría
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <StatCard
            label="Total categorías"
            value={stats.total}
            icon={<Tag size={20} className="text-primary" />}
            color="bg-primary/10"
          />
          <StatCard
            label="Con productos"
            value={stats.conProductos}
            icon={<Package size={20} className="text-success" />}
            color="bg-success-50"
          />
          <StatCard
            label="Sin productos"
            value={stats.sinProductos}
            icon={<FolderOpen size={20} className="text-neutral-400" />}
            color="bg-neutral-100"
          />
        </div>
      </div>

      {/* ── Búsqueda ── */}
      <div className="px-6 py-3 bg-white border-b border-neutral-200">
        <div className="relative max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar categoría..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-neutral-300 text-sm
                       outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>
      </div>

      {/* ── Contenido ── */}
      <div className="flex-1 overflow-auto px-6 py-4">

        {/* Error global */}
        {error && (
          <div className="flex items-center gap-2 p-4 bg-danger-50 border border-danger-100
                          rounded-xl text-sm text-danger mb-4">
            <AlertCircle size={16} className="shrink-0" />
            {error}
          </div>
        )}

        {/* Sin resultados */}
        {!isLoading && categoriasFiltradas.length === 0 && (
          <div className="flex flex-col items-center justify-center h-48 text-neutral-400">
            <Tag size={48} className="mb-3 opacity-30" />
            <p className="text-sm">
              {busqueda
                ? 'No se encontraron categorías con esa búsqueda'
                : 'No hay categorías todavía. ¡Creá la primera!'}
            </p>
            {!busqueda && (
              <button
                onClick={abrirCrear}
                className="mt-3 text-sm text-primary font-medium hover:underline"
              >
                + Nueva categoría
              </button>
            )}
          </div>
        )}

        {/* Grid de categorías */}
        {categoriasFiltradas.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {categoriasFiltradas.map(categoria => (
              <CategoriaCard
                key={categoria.categoriaID}
                categoria={categoria}
                onEditar={() => abrirEditar(categoria)}
                onEliminar={() => confirmarEliminar(categoria)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Modal: Crear / Editar ── */}
      <CategoriaModal
        mode={modalMode}
        categoria={categoriaSeleccionada}
        isSaving={isSaving}
        saveError={saveError}
        onClose={cerrarModal}
        onGuardar={guardar}
      />

      {/* ── Modal: Confirmar eliminar ── */}
      <Modal
        isOpen={!!categoriaAEliminar}
        onClose={cancelarEliminar}
        title="Eliminar categoría"
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={cancelarEliminar} disabled={isDeleting}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={eliminar} loading={isDeleting}>
              Eliminar
            </Button>
          </>
        }
      >
        {categoriaAEliminar && (
          <div className="space-y-4">
            <p className="text-sm text-neutral-700">
              ¿Estás seguro de que querés eliminar la categoría{' '}
              <span className="font-bold">"{categoriaAEliminar.nombre}"</span>?
            </p>

            {(categoriaAEliminar.cantidadProductos ?? 0) > 0 && (
              <div className="flex items-start gap-2 p-3 bg-warning-50 border border-warning-200
                              rounded-xl text-sm text-warning-700">
                <AlertCircle size={15} className="mt-0.5 shrink-0" />
                <p>
                  Esta categoría tiene{' '}
                  <span className="font-bold">{categoriaAEliminar.cantidadProductos} producto
                  {categoriaAEliminar.cantidadProductos !== 1 ? 's' : ''}</span> asociado
                  {categoriaAEliminar.cantidadProductos !== 1 ? 's' : ''}.
                  Asegurate de reasignarlos antes de eliminarla.
                </p>
              </div>
            )}

            {deleteError && (
              <div className="flex items-center gap-2 p-3 bg-danger-50 border border-danger-100
                              rounded-xl text-sm text-danger">
                <AlertCircle size={15} className="shrink-0" />
                {deleteError}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

// ────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTE: CategoriaCard
// ────────────────────────────────────────────────────────────────────────────

const CategoriaCard: React.FC<{
  categoria: Categoria;
  onEditar: () => void;
  onEliminar: () => void;
}> = ({ categoria, onEditar, onEliminar }) => {
  const sinProductos = (categoria.cantidadProductos ?? 0) === 0;

  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-5
                    hover:border-primary/40 hover:shadow-sm transition-all group">

      {/* Ícono + nombre */}
      <div className="flex items-start justify-between mb-4">
        <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center
                        group-hover:bg-primary transition-colors">
          <Tag size={20} className="text-primary group-hover:text-white transition-colors" />
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onEditar}
            title="Editar"
            className="p-1.5 rounded-lg text-neutral-400 hover:text-primary
                       hover:bg-primary/10 transition-all"
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={onEliminar}
            title="Eliminar"
            className="p-1.5 rounded-lg text-neutral-400 hover:text-danger
                       hover:bg-danger-50 transition-all"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* Nombre */}
      <h3 className="font-semibold text-neutral-800 mb-2 truncate" title={categoria.nombre}>
        {categoria.nombre}
      </h3>

      {/* Cantidad de productos */}
      <div className="flex items-center gap-1.5">
        <Package size={13} className="text-neutral-400" />
        {sinProductos ? (
          <span className="text-xs text-neutral-400">Sin productos</span>
        ) : (
          <span className="text-xs text-neutral-500">
            {categoria.cantidadProductos} producto
            {categoria.cantidadProductos !== 1 ? 's' : ''}
          </span>
        )}
      </div>
    </div>
  );
};

export default CategoriasPage;
