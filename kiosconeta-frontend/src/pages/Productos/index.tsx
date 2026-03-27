// ════════════════════════════════════════════════════════════════════════════
// PAGE: Productos — ABM + gestión de stock
// ════════════════════════════════════════════════════════════════════════════

import React from 'react';
import {
  Plus,
  Search,
  RefreshCw,
  Pencil,
  Trash2,
  Package,
  ToggleLeft,
  ToggleRight,
  PackageSearch,
  AlertTriangle,
  TrendingUp,
} from 'lucide-react';
import { Button, Input, Badge, Table, Modal, LoadingOverlay } from '@/components/commons';
import { formatCurrency, formatDate, getStockStatus } from '@/utils/formatters';
import { ProductoModal } from './ProductoModal';
import { StockModal } from './StockModal';
import { useProductos } from './useProductos';
import type { Producto } from '@/types';

// ────────────────────────────────────────────────────────────────────────────
// HELPERS UI
// ────────────────────────────────────────────────────────────────────────────

const StockBadge: React.FC<{ stock: number; stockMinimo: number }> = ({
  stock,
  stockMinimo,
}) => {
  const status = getStockStatus(stock, stockMinimo);
  if (status === 'critico')
    return (
      <Badge variant="danger" className="text-xs">
        Sin stock
      </Badge>
    );
  if (status === 'bajo')
    return (
      <Badge variant="warning" className="text-xs">
        Stock bajo ({stock})
      </Badge>
    );
  return <span className="text-sm font-medium text-neutral-700">{stock}</span>;
};

// ────────────────────────────────────────────────────────────────────────────
// STAT CARD
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

const ProductosPage: React.FC = () => {
  const {
    productos,
    categorias,
    stats,
    isLoading,
    error,
    filtros,
    setFiltros,
    modalMode,
    productoSeleccionado,
    isSaving,
    saveError,
    abrirModalCrear,
    abrirModalEditar,
    cerrarModal,
    guardarProducto,
    modalStock,
    setModalStock,
    ajustarStock,
    productoAEliminar,
    isDeleting,
    confirmarEliminar,
    cancelarEliminar,
    eliminarProducto,
    toggleActivo,
    recargar,
  } = useProductos();

  // ── Columnas de la tabla ─────────────────────────────────────────────

  const columnas = [
    {
      key: 'nombre',
      header: 'Producto',
      render: (p: Producto) => (
        <div>
          <p className="font-medium text-neutral-900">{p.nombre}</p>
          {p.codigoBarras && (
            <p className="text-xs text-neutral-400 font-mono">{p.codigoBarras}</p>
          )}
        </div>
      ),
    },
    {
      key: 'categoria',
      header: 'Categoría',
      render: (p: Producto) => (
        <span className="text-sm text-neutral-600">
          {categorias.find((c) => c.categoriaId === p.categoriaId)?.nombre || '—'}
        </span>
      ),
    },
    {
      key: 'precioCosto',
      header: 'Costo',
      align: 'right' as const,
      render: (p: Producto) => (
        <span className="text-sm text-neutral-600">{formatCurrency(p.precioCosto)}</span>
      ),
    },
    {
      key: 'precioVenta',
      header: 'Venta',
      align: 'right' as const,
      render: (p: Producto) => (
        <span className="text-sm font-semibold text-neutral-900">
          {formatCurrency(p.precioVenta)}
        </span>
      ),
    },
    {
      key: 'stock',
      header: 'Stock',
      align: 'center' as const,
      render: (p: Producto) => (
        <button
          onClick={() => setModalStock(p)}
          title="Ajustar stock"
          className="flex items-center gap-1.5 mx-auto hover:opacity-70 transition-opacity"
        >
          <StockBadge stock={p.stock} stockMinimo={p.stockMinimo} />
        </button>
      ),
    },
    {
      key: 'fechaVencimiento',
      header: 'Vence',
      render: (p: Producto) =>
        p.fechaVencimiento ? (
          <span className="text-xs text-neutral-500">{formatDate(p.fechaVencimiento)}</span>
        ) : (
          <span className="text-xs text-neutral-300">—</span>
        ),
    },
    {
      key: 'activo',
      header: 'Estado',
      align: 'center' as const,
      render: (p: Producto) => (
        <Badge variant={p.activo ? 'success' : 'danger'}>
          {p.activo ? 'Activo' : 'Inactivo'}
        </Badge>
      ),
    },
    {
      key: 'acciones',
      header: '',
      align: 'right' as const,
      render: (p: Producto) => (
        <div className="flex items-center justify-end gap-1">
          {/* Editar */}
          <button
            onClick={() => abrirModalEditar(p)}
            title="Editar"
            className="p-1.5 rounded-lg text-neutral-400 hover:text-primary hover:bg-primary/10 transition-colors"
          >
            <Pencil size={15} />
          </button>

          {/* Toggle activo */}
          <button
            onClick={() => toggleActivo(p)}
            title={p.activo ? 'Desactivar' : 'Activar'}
            className={`p-1.5 rounded-lg transition-colors ${
              p.activo
                ? 'text-green-500 hover:text-green-700 hover:bg-green-50'
                : 'text-neutral-300 hover:text-green-500 hover:bg-green-50'
            }`}
          >
            {p.activo ? <ToggleRight size={17} /> : <ToggleLeft size={17} />}
          </button>

          {/* Eliminar */}
          <button
            onClick={() => confirmarEliminar(p)}
            title="Eliminar"
            className="p-1.5 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            <Trash2 size={15} />
          </button>
        </div>
      ),
    },
  ];

  // ────────────────────────────────────────────────────────────────────────
  // RENDER
  // ────────────────────────────────────────────────────────────────────────

  if (isLoading) return <LoadingOverlay message="Cargando productos..." />;

  return (
    <>
    <div className="p-6 space-y-6">

        {/* ── HEADER ──────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Productos</h1>
            <p className="text-sm text-neutral-500 mt-0.5">
              Gestioná tu catálogo, precios y stock
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<RefreshCw size={15} />}
              onClick={recargar}
            >
              Actualizar
            </Button>
            <Button
              variant="primary"
              leftIcon={<Plus size={16} />}
              onClick={abrirModalCrear}
            >
              Nuevo producto
            </Button>
          </div>
        </div>

        {/* ── ERROR GLOBAL ─────────────────────────────────────────────── */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center gap-2">
            <AlertTriangle size={16} />
            {error}
          </div>
        )}

        {/* ── STATS ────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Total productos"
            value={stats.total}
            icon={<Package size={20} className="text-purple-600" />}
            color="bg-purple-50"
          />
          <StatCard
            label="Activos"
            value={stats.activos}
            icon={<TrendingUp size={20} className="text-green-600" />}
            color="bg-green-50"
          />
          <StatCard
            label="Stock bajo"
            value={stats.stockBajo}
            icon={<AlertTriangle size={20} className="text-amber-600" />}
            color="bg-amber-50"
          />
          <StatCard
            label="Sin stock"
            value={stats.sinStock}
            icon={<PackageSearch size={20} className="text-red-500" />}
            color="bg-red-50"
          />
        </div>

        {/* ── FILTROS ──────────────────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-neutral-200 p-4">
          <div className="flex flex-wrap gap-3 items-end">
            {/* Búsqueda */}
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Buscar por nombre o código de barras..."
                value={filtros.busqueda}
                onChange={(e) =>
                  setFiltros((prev) => ({ ...prev, busqueda: e.target.value }))
                }
                leftIcon={<Search size={16} />}
              />
            </div>

            {/* Categoría */}
            <div className="w-48">
              <select
                className="px-3 py-2 border border-neutral-300 rounded-md w-full text-sm
                  focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-20
                  focus:border-primary bg-white text-neutral-700"
                value={filtros.categoriaId}
                onChange={(e) =>
                  setFiltros((prev) => ({
                    ...prev,
                    categoriaId: e.target.value === '' ? '' : Number(e.target.value),
                  }))
                }
              >
                <option value="">Todas las categorías</option>
                {categorias.map((cat) => (
                  <option key={cat.categoriaId} value={cat.categoriaId}>
                    {cat.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Toggles de filtro */}
            <div className="flex gap-2">
              <button
                onClick={() =>
                  setFiltros((prev) => ({ ...prev, soloStockBajo: !prev.soloStockBajo }))
                }
                className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                  filtros.soloStockBajo
                    ? 'bg-amber-50 border-amber-400 text-amber-700'
                    : 'bg-white border-neutral-300 text-neutral-600 hover:border-neutral-400'
                }`}
              >
                ⚠ Stock bajo
              </button>
              <button
                onClick={() =>
                  setFiltros((prev) => ({ ...prev, soloActivos: !prev.soloActivos }))
                }
                className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                  filtros.soloActivos
                    ? 'bg-primary/10 border-primary text-primary'
                    : 'bg-white border-neutral-300 text-neutral-600 hover:border-neutral-400'
                }`}
              >
                Solo activos
              </button>
            </div>

            {/* Resultados */}
            <span className="text-sm text-neutral-400 whitespace-nowrap">
              {productos.length} producto{productos.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* ── TABLA ────────────────────────────────────────────────────── */}
        <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
          <Table
            columns={columnas}
            data={productos}
            keyExtractor={(p) => p.productoId}
            emptyMessage="No se encontraron productos con los filtros seleccionados"
          />
        </div>
      </div>

      {/* ── MODALES ─────────────────────────────────────────────────────── */}

      {/* Crear / Editar */}
      <ProductoModal
        mode={modalMode}
        producto={productoSeleccionado}
        categorias={categorias}
        isSaving={isSaving}
        saveError={saveError}
        onClose={cerrarModal}
        onSave={guardarProducto}
      />

      {/* Ajuste de stock */}
      <StockModal
        producto={modalStock}
        onClose={() => setModalStock(null)}
        onAjustar={ajustarStock}
      />

      {/* Confirmar eliminar */}
      <Modal
        isOpen={!!productoAEliminar}
        onClose={cancelarEliminar}
        title="Eliminar producto"
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={cancelarEliminar} disabled={isDeleting}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={eliminarProducto} loading={isDeleting}>
              Sí, eliminar
            </Button>
          </>
        }
      >
        <p className="text-neutral-700">
          ¿Estás seguro de eliminar{' '}
          <strong>{productoAEliminar?.nombre}</strong>?
        </p>
        <p className="text-sm text-neutral-500 mt-2">
          Esta acción no se puede deshacer. Si el producto tiene ventas asociadas,
          considerá desactivarlo en su lugar.
        </p>
      </Modal>
    </>
  );
};

export default ProductosPage;