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

  // ── Estado: modal ingreso de mercadería ───────────────────────────────
  const [modalIngreso, setModalIngreso] = useState(false);

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
      if (filtros.soloActivos && !p.activo) return false;
      // bajoStock viene calculado del backend, pero también lo calculamos localmente
      if (filtros.soloStockBajo && p.stockActual >= p.stockMinimo) return false;
      if (filtros.categoriaId !== '' && p.categoriaId !== filtros.categoriaId) return false;
      if (filtros.busqueda) {
        const q = filtros.busqueda.toLowerCase();
        const matchNombre = p.nombre.toLowerCase().includes(q);
        const matchCodigo = p.codigoBarra?.toLowerCase().includes(q);
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
      await productosApi.ajustarStock(productoId, Math.abs(cantidad), cantidad > 0 ? 'agregar' : 'quitar');
      setProductos((prev) =>
        prev.map((p) =>
          p.productoId === productoId
            ? { ...p, stockActual: Math.max(0, p.stockActual + cantidad) }
            : p
        )
      );
      setModalStock(null);
    } catch (err: any) {
      setError(err.message || 'Error al ajustar stock');
    }
  };

  // ────────────────────────────────────────────────────────────────────────
  // INGRESO DE MERCADERÍA
  // Suma stock + guarda distribuidor en el producto
  // ────────────────────────────────────────────────────────────────────────

  const ingresarMercaderia = async (
    productoId: number,
    cantidad: number,
    distribuidor: string,
    precioCosto: number
  ) => {
    const producto = productos.find((p) => p.productoId === productoId);
    if (!producto) throw new Error('Producto no encontrado');

    // 1. Sumar stock
    await productosApi.ajustarStock(productoId, cantidad, 'agregar');

    // 2. Si cambió el costo o el distribuidor, actualizar el producto
    const costoCambio = precioCosto !== producto.precioCosto;
    const distribuidorCambio = distribuidor && distribuidor !== producto.distribuidor;

    if (costoCambio || distribuidorCambio) {
      await productosApi.update(productoId, {
        productoId,
        nombre: producto.nombre,
        codigoBarra: producto.codigoBarra,
        precioCosto: costoCambio ? precioCosto : producto.precioCosto,
        precioVenta: producto.precioVenta,
        stockActual: producto.stockActual + cantidad,
        stockMinimo: producto.stockMinimo,
        categoriaId: producto.categoriaId,
        fechaVencimiento: producto.fechaVencimiento,
        activo: producto.activo,
        suelto: producto.suelto ?? false,
        distribuidor: distribuidorCambio ? distribuidor : producto.distribuidor,
      });
    }

    // Actualizar estado local
    setProductos((prev) =>
      prev.map((p) =>
        p.productoId === productoId
          ? {
              ...p,
              stockActual: p.stockActual + cantidad,
              precioCosto: costoCambio ? precioCosto : p.precioCosto,
              distribuidor: distribuidorCambio ? distribuidor : p.distribuidor,
            }
          : p
      )
    );
    setModalIngreso(false);
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
    const stockBajo = productos.filter((p) => p.activo && p.stockActual < p.stockMinimo).length;
    const sinStock = productos.filter((p) => p.activo && p.stockActual === 0).length;
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

    // Ingreso de mercadería
    modalIngreso,
    setModalIngreso,
    ingresarMercaderia,

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