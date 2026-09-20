// ════════════════════════════════════════════════════════════════════════════
// HOOK: useProductos — Lógica de la página de Productos
// ════════════════════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback, useMemo } from 'react';
import { productosApi, categoriasApi } from '@/apis';
import { useAuth } from '@/contexts/AuthContext';
import { tagsApi } from '@/apis/promocionesApi'; 
import type { Producto, Categoria, CreateProductoDTO, UpdateProductoDTO ,Distribuidor , Tag, TipoAjustePrecio} from '@/types';
import { distribuidoresApi } from '@/apis/distribuidoresApi';
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
  const [distribuidores, setDistribuidores] = useState<Distribuidor[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const agregarTagLocal = (tag: Tag) => {
    setTags(prev => [...prev, tag]);
  };

  const eliminarTagLocal = (tagId: number) => {
    setTags(prev => prev.filter(t => t.tagId !== tagId));
  };

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

  // ── Estado: modal ajuste masivo de precios ────────────────────────────
  const [modalAjustePrecios, setModalAjustePrecios] = useState(false);
  const [isSavingAjustePrecios, setIsSavingAjustePrecios] = useState(false);
  const [ajustePreciosError, setAjustePreciosError] = useState<string | null>(null);

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
    const [prods, cats, dists, tgs] = await Promise.all([   // ← agregar tgs
      productosApi.getByKiosco(user.kioscoId),
      categoriasApi.getByKiosco(user.kioscoId),
      distribuidoresApi.getByKiosco(user.kioscoId),
      tagsApi.getByKiosco(user.kioscoId),   // ← agregar
    ]);
    setProductos(prods);
    setCategorias(cats);
    setDistribuidores(dists);
    setTags(tgs);   // ← agregar
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

  // Coincide si el nombre contiene TODAS las palabras de la búsqueda, sin
  // importar el orden — mismo criterio que en POSVenta.tsx.
  const coincideBusqueda = (nombre: string, query: string) => {
    const palabras = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    const nombreLower = nombre.toLowerCase();
    return palabras.every(palabra => nombreLower.includes(palabra));
  };

  const productosFiltrados = useMemo(() => {
    return productos.filter((p) => {
      if (filtros.soloActivos && !p.activo) return false;
      // bajoStock viene calculado del backend, pero también lo calculamos localmente
      if (filtros.soloStockBajo && p.stockActual >= p.stockMinimo) return false;
      if (filtros.categoriaId !== '' && p.categoriaId !== filtros.categoriaId) return false;
      if (filtros.busqueda) {
        const q = filtros.busqueda.toLowerCase();
        const matchNombre = coincideBusqueda(p.nombre, q);
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
      await productosApi.ajustarStock(productoId, cantidad,user!.empleadoId, Number(user!.kioscoId),cantidad > 0 ? 'agregar' : 'quitar');
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
  distribuidorId: number | undefined,
  precioCosto: number,
) => {
  const producto = productos.find(p => p.productoId === productoId);
  if (!producto) throw new Error('Producto no encontrado');

  await productosApi.ajustarStock(productoId, cantidad, user!.empleadoId,Number(user!.kioscoId), 'agregar');

  const costoCambio       = precioCosto !== producto.precioCosto;
  const distribuidorCambio = distribuidorId !== producto.distribuidorId;

  if (costoCambio || distribuidorCambio) {
    await productosApi.update(productoId, {
      productoId,
      nombre:        producto.nombre,
      codigoBarra:   producto.codigoBarra,
      precioCosto:   costoCambio ? precioCosto : producto.precioCosto,
      precioVenta:   producto.precioVenta,
      // Sin esto, el DTO en C# (no nullable) llega en 0/'Unidad' y el backend
      // resetea silenciosamente un producto por kilo a "Unidad" en cada ingreso
      // de mercadería que toque costo o distribuidor.
      unidadMedida:  producto.unidadMedida,
      stockActual:   producto.stockActual + cantidad,
      stockMinimo:   producto.stockMinimo,
      categoriaId:   producto.categoriaId,
      distribuidorId: distribuidorCambio ? distribuidorId : producto.distribuidorId, // ← cambio
      fechaVencimiento: producto.fechaVencimiento,
      activo:        producto.activo,
      suelto:        producto.suelto ?? false,
    });
  }

  setProductos(prev =>
    prev.map(p =>
      p.productoId === productoId
        ? {
            ...p,
            stockActual:    p.stockActual + cantidad,
            precioCosto:    costoCambio ? precioCosto : p.precioCosto,
            distribuidorId: distribuidorCambio ? distribuidorId : p.distribuidorId,
          }
        : p
    )
  );
  setModalIngreso(false);
};

  // ────────────────────────────────────────────────────────────────────────
  // AJUSTE MASIVO DE PRECIOS
  // ────────────────────────────────────────────────────────────────────────

  const ajustarPreciosMasivo = async (
    productoIds: number[],
    tipoAjuste: TipoAjustePrecio,
    valorVenta: number | undefined,
    valorCosto: number | undefined
  ) => {
    if (!user?.kioscoId) return;
    setIsSavingAjustePrecios(true);
    setAjustePreciosError(null);

    try {
      const resultado = await productosApi.ajustarPreciosMasivo({
        kioscoId: user.kioscoId,
        productoIds,
        tipoAjuste,
        valorVenta,
        valorCosto,
      });

      // Actualizamos en el estado local solo los productos que realmente
      // se modificaron (algunos pueden haberse omitido, ver resultado.errores)
      setProductos(prev => {
        const actualizadosPorId = new Map(resultado.productos.map(p => [p.productoId, p]));
        return prev.map(p => actualizadosPorId.get(p.productoId) ?? p);
      });

      if (resultado.errores.length > 0) {
        setAjustePreciosError(
          `Se actualizaron ${resultado.cantidadActualizados} de ${productoIds.length}. ` +
          `Omitidos: ${resultado.errores.join(' | ')}`
        );
        // No cerramos el modal si hubo omisiones, para que el usuario lea el detalle
      } else {
        setModalAjustePrecios(false);
      }
    } catch (err: any) {
      setAjustePreciosError(err.message || 'Error al ajustar los precios');
    } finally {
      setIsSavingAjustePrecios(false);
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
    distribuidores,
    tags,
    agregarTagLocal,
eliminarTagLocal,
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

    // Ajuste masivo de precios
    modalAjustePrecios,
    setModalAjustePrecios,
    ajustarPreciosMasivo,
    isSavingAjustePrecios,
    ajustePreciosError,

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