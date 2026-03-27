// ════════════════════════════════════════════════════════════════════════════
// HOOK: useProductos — Lógica de la página de Productos
// ════════════════════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback, useMemo } from 'react';
import { productosApi, categoriasApi } from '@/apis';
import { useAuth } from '@/contexts/AuthContext';
import type { Producto, Categoria, CreateProductoDTO, UpdateProductoDTO } from '@/types';

// ────────────────────────────────────────────────────────────────────────────
// TYPES
// ────────────────────────────────────────────────────────────────────────────

export type ModalMode = 'crear' | 'editar' | null;

export interface FiltrosState {
  busqueda: string;
  categoriaId: number | '';
  soloStockBajo: boolean;
  soloActivos: boolean;
}

// ────────────────────────────────────────────────────────────────────────────
// HOOK
// ────────────────────────────────────────────────────────────────────────────

export const useProductos = () => {
  const { user } = useAuth();

  // ── Estado: datos ──────────────────────────────────────────────────────
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Estado: filtros ────────────────────────────────────────────────────
  const [filtros, setFiltros] = useState<FiltrosState>({
    busqueda: '',
    categoriaId: '',
    soloStockBajo: false,
    soloActivos: true,
  });

  // ── Estado: modal ──────────────────────────────────────────────────────
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // ── Estado: modal ajuste de stock ──────────────────────────────────────
  const [modalStock, setModalStock] = useState<Producto | null>(null);

  // ── Estado: confirmación eliminar ─────────────────────────────────────
  const [productoAEliminar, setProductoAEliminar] = useState<Producto | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ────────────────────────────────────────────────────────────────────────
  // CARGAR DATOS
  // ────────────────────────────────────────────────────────────────────────

  const cargarDatos = useCallback(async () => {
    if (!user?.kioscoId) return;
    setIsLoading(true);
    setError(null);

    try {
      const [prods, cats] = await Promise.all([
        productosApi.getAll(),
        categoriasApi.getAll(),
      ]);
      setProductos(prods);
      setCategorias(cats);
    } catch (err: any) {
      setError(err.message || 'Error al cargar los productos');
    } finally {
      setIsLoading(false);
    }
  }, [user?.kioscoId]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // ────────────────────────────────────────────────────────────────────────
  // FILTRADO (en cliente — el backend ya devuelve todo)
  // ────────────────────────────────────────────────────────────────────────

  const productosFiltrados = useMemo(() => {
    return productos.filter((p) => {
      // Filtro activos
      if (filtros.soloActivos && !p.activo) return false;

      // Filtro stock bajo
      if (filtros.soloStockBajo && p.stock >= p.stockMinimo) return false;

      // Filtro categoría
      if (filtros.categoriaId !== '' && p.categoriaId !== filtros.categoriaId) return false;

      // Filtro búsqueda
      if (filtros.busqueda) {
        const q = filtros.busqueda.toLowerCase();
        const matchNombre = p.nombre.toLowerCase().includes(q);
        const matchCodigo = p.codigoBarras?.toLowerCase().includes(q);
        if (!matchNombre && !matchCodigo) return false;
      }

      return true;
    });
  }, [productos, filtros]);

  // ────────────────────────────────────────────────────────────────────────
  // MODAL CREAR / EDITAR
  // ────────────────────────────────────────────────────────────────────────

  const abrirModalCrear = () => {
    setProductoSeleccionado(null);
    setSaveError(null);
    setModalMode('crear');
  };

  const abrirModalEditar = (producto: Producto) => {
    setProductoSeleccionado(producto);
    setSaveError(null);
    setModalMode('editar');
  };

  const cerrarModal = () => {
    setModalMode(null);
    setProductoSeleccionado(null);
    setSaveError(null);
  };

  const guardarProducto = async (data: CreateProductoDTO | UpdateProductoDTO) => {
    if (!user?.kioscoId) return;
    setIsSaving(true);
    setSaveError(null);

    try {
      if (modalMode === 'crear') {
        const nuevo = await productosApi.create({
          ...(data as CreateProductoDTO),
          kioscoId: user.kioscoId,
        });
        setProductos((prev) => [...prev, nuevo]);
      } else if (modalMode === 'editar' && productoSeleccionado) {
        const actualizado = await productosApi.update(
          productoSeleccionado.productoId,
          data as UpdateProductoDTO
        );
        setProductos((prev) =>
          prev.map((p) =>
            p.productoId === actualizado.productoId ? actualizado : p
          )
        );
      }
      cerrarModal();
    } catch (err: any) {
      setSaveError(err.message || 'Error al guardar el producto');
    } finally {
      setIsSaving(false);
    }
  };

  // ────────────────────────────────────────────────────────────────────────
  // TOGGLE ACTIVO
  // ────────────────────────────────────────────────────────────────────────

  const toggleActivo = async (producto: Producto) => {
    try {
      const nuevoEstado = !producto.activo;
      await productosApi.toggleActivo(producto.productoId, nuevoEstado);
      setProductos((prev) =>
        prev.map((p) =>
          p.productoId === producto.productoId ? { ...p, activo: nuevoEstado } : p
        )
      );
    } catch (err: any) {
      setError(err.message || 'Error al cambiar estado del producto');
    }
  };

  // ────────────────────────────────────────────────────────────────────────
  // AJUSTE DE STOCK
  // ────────────────────────────────────────────────────────────────────────

  const ajustarStock = async (productoId: number, cantidad: number) => {
    try {
      // El endpoint PATCH /productos/{id}/stock recibe cantidad como query param
      // cantidad positiva = sumar, negativa = restar
      await productosApi.ajustarStock(productoId, Math.abs(cantidad), cantidad > 0 ? 'agregar' : 'quitar');
      setProductos((prev) =>
        prev.map((p) =>
          p.productoId === productoId
            ? { ...p, stock: Math.max(0, p.stock + cantidad) }
            : p
        )
      );
      setModalStock(null);
    } catch (err: any) {
      setError(err.message || 'Error al ajustar stock');
    }
  };

  // ────────────────────────────────────────────────────────────────────────
  // ELIMINAR
  // ────────────────────────────────────────────────────────────────────────

  const confirmarEliminar = (producto: Producto) => {
    setProductoAEliminar(producto);
  };

  const cancelarEliminar = () => {
    setProductoAEliminar(null);
  };

  const eliminarProducto = async () => {
    if (!productoAEliminar) return;
    setIsDeleting(true);

    try {
      await productosApi.delete(productoAEliminar.productoId);
      setProductos((prev) =>
        prev.filter((p) => p.productoId !== productoAEliminar.productoId)
      );
      setProductoAEliminar(null);
    } catch (err: any) {
      setError(err.message || 'Error al eliminar el producto');
    } finally {
      setIsDeleting(false);
    }
  };

  // ────────────────────────────────────────────────────────────────────────
  // STATS
  // ────────────────────────────────────────────────────────────────────────

  const stats = useMemo(() => {
    const activos = productos.filter((p) => p.activo).length;
    const stockBajo = productos.filter((p) => p.activo && p.stock < p.stockMinimo).length;
    const sinStock = productos.filter((p) => p.activo && p.stock === 0).length;
    return { total: productos.length, activos, stockBajo, sinStock };
  }, [productos]);

  // ────────────────────────────────────────────────────────────────────────
  // RETURN
  // ────────────────────────────────────────────────────────────────────────

  return {
    // Datos
    productos: productosFiltrados,
    categorias,
    stats,
    isLoading,
    error,

    // Filtros
    filtros,
    setFiltros,

    // Modal crear/editar
    modalMode,
    productoSeleccionado,
    isSaving,
    saveError,
    abrirModalCrear,
    abrirModalEditar,
    cerrarModal,
    guardarProducto,

    // Modal stock
    modalStock,
    setModalStock,
    ajustarStock,

    // Eliminar
    productoAEliminar,
    isDeleting,
    confirmarEliminar,
    cancelarEliminar,
    eliminarProducto,

    // Toggle
    toggleActivo,

    // Refrescar
    recargar: cargarDatos,
  };
};