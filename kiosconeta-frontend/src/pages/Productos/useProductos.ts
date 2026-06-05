import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { productosApi, categoriasApi } from '@/apis';
import { useAuth } from '@/contexts/AuthContext';
import type { Producto, Categoria, CreateProductoDTO, UpdateProductoDTO, Distribuidor } from '@/types';
import { distribuidoresApi } from '@/apis/distribuidoresApi';

export type ModalMode = 'crear' | 'editar' | null;

export interface FiltrosState {
  busqueda: string;
  categoriaId: number | '';
  soloStockBajo: boolean;
  soloActivos: boolean;
}

export const useProductos = () => {
  const { user } = useAuth();

  // ── Datos ──────────────────────────────────────────────────────────────
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [distribuidores, setDistribuidores] = useState<Distribuidor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cargandoMas, setCargandoMas] = useState(false);
  const [hayMas, setHayMas] = useState(true);
  const [paginaActual, setPaginaActual] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [totalProductos, setTotalProductos] = useState(0);

  // ── Ref para scroll infinito ───────────────────────────────────────────
  const observerRef = useRef<HTMLDivElement>(null);

  // ── Filtros ────────────────────────────────────────────────────────────
  const [filtros, setFiltros] = useState<FiltrosState>({
    busqueda: '',
    categoriaId: '',
    soloStockBajo: false,
    soloActivos: true,
  });

  // ── Modal crear/editar ─────────────────────────────────────────────────
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // ── Modal stock e ingreso ──────────────────────────────────────────────
  const [modalStock, setModalStock] = useState<Producto | null>(null);
  const [modalIngreso, setModalIngreso] = useState(false);

  // ── Eliminar ───────────────────────────────────────────────────────────
  const [productoAEliminar, setProductoAEliminar] = useState<Producto | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ────────────────────────────────────────────────────────────────────────
  // CARGAR PRODUCTOS PAGINADOS
  // ────────────────────────────────────────────────────────────────────────

  // REEMPLAZAR cargarProductos
const cargarProductos = useCallback(async (pagina: number, resetear = false) => {
  if (!user?.kioscoId) return;
  if (pagina === 1) setIsLoading(true);
  else setCargandoMas(true);
  setError(null);

  try {
    const resultado = await productosApi.getPaginado(
      user.kioscoId,
      pagina,
      30,
      {
        busqueda: filtros.busqueda || undefined,
        categoriaId: filtros.categoriaId || undefined,
        soloStockBajo: filtros.soloStockBajo || undefined,
        soloActivos: filtros.soloActivos,
      }
    );
    setProductos(prev => resetear ? resultado.items : [...prev, ...resultado.items]);
    if (resetear) setTotalProductos(resultado.totalItems);
    setHayMas(resultado.tienePaginaSiguiente);
    setPaginaActual(pagina);
  } catch (err: any) {
    setError(err.message || 'Error al cargar los productos');
  } finally {
    setIsLoading(false);
    setCargandoMas(false);
  }
}, [user?.kioscoId, filtros.busqueda, filtros.categoriaId, filtros.soloStockBajo, filtros.soloActivos]);

  // Cargar categorías y distribuidores solo una vez
  const cargarAuxiliares = useCallback(async () => {
    if (!user?.kioscoId) return;
    try {
      const [cats, dists] = await Promise.all([
        categoriasApi.getByKiosco(user.kioscoId),
        distribuidoresApi.getByKiosco(user.kioscoId),
      ]);
      setCategorias(cats);
      setDistribuidores(dists);
    } catch (err: any) {
      setError(err.message || 'Error al cargar datos auxiliares');
    }
  }, [user?.kioscoId]);

  // Al montar o cambiar búsqueda → resetear desde página 1
  useEffect(() => {
  cargarProductos(1, true);
}, [cargarProductos]);

  useEffect(() => {
    cargarAuxiliares();
  }, [cargarAuxiliares]);

  // ── Scroll infinito ────────────────────────────────────────────────────
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hayMas && !cargandoMas && !isLoading) {
          cargarProductos(paginaActual + 1);
        }
      },
      { threshold: 0.1 }
    );
    if (observerRef.current) observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [hayMas, cargandoMas, isLoading, paginaActual, cargarProductos]);

  

  const productosFiltrados = productos;


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
        setProductos(prev => [nuevo, ...prev]);
      } else if (modalMode === 'editar' && productoSeleccionado) {
        const actualizado = await productosApi.update(
          productoSeleccionado.productoId,
          data as UpdateProductoDTO
        );
        setProductos(prev =>
          prev.map(p => p.productoId === actualizado.productoId ? actualizado : p)
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
      setProductos(prev =>
        prev.map(p => p.productoId === producto.productoId ? { ...p, activo: nuevoEstado } : p)
      );
    } catch (err: any) {
      setError(err.message || 'Error al cambiar estado del producto');
    }
  };

  // ────────────────────────────────────────────────────────────────────────
  // STOCK
  // ────────────────────────────────────────────────────────────────────────

  const ajustarStock = async (productoId: number, cantidad: number) => {
    try {
      await productosApi.ajustarStock(
        productoId, cantidad, user!.empleadoId,
        Number(user!.kioscoId), cantidad > 0 ? 'agregar' : 'quitar'
      );
      setProductos(prev =>
        prev.map(p =>
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

  const ingresarMercaderia = async (
    productoId: number,
    cantidad: number,
    distribuidorId: number | undefined,
    precioCosto: number,
  ) => {
    const producto = productos.find(p => p.productoId === productoId);
    if (!producto) throw new Error('Producto no encontrado');

    await productosApi.ajustarStock(productoId, cantidad, user!.empleadoId, Number(user!.kioscoId), 'agregar');

    const costoCambio = precioCosto !== producto.precioCosto;
    const distribuidorCambio = distribuidorId !== producto.distribuidorId;

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
        distribuidorId: distribuidorCambio ? distribuidorId : producto.distribuidorId,
        fechaVencimiento: producto.fechaVencimiento,
        activo: producto.activo,
        suelto: producto.suelto ?? false,
      });
    }

    setProductos(prev =>
      prev.map(p =>
        p.productoId === productoId
          ? {
              ...p,
              stockActual: p.stockActual + cantidad,
              precioCosto: costoCambio ? precioCosto : p.precioCosto,
              distribuidorId: distribuidorCambio ? distribuidorId : p.distribuidorId,
            }
          : p
      )
    );
    setModalIngreso(false);
  };

  // ────────────────────────────────────────────────────────────────────────
  // ELIMINAR
  // ────────────────────────────────────────────────────────────────────────

  const confirmarEliminar = (producto: Producto) => setProductoAEliminar(producto);
  const cancelarEliminar = () => setProductoAEliminar(null);

  const eliminarProducto = async () => {
    if (!productoAEliminar) return;
    setIsDeleting(true);
    try {
      await productosApi.delete(productoAEliminar.productoId);
      setProductos(prev => prev.filter(p => p.productoId !== productoAEliminar.productoId));
      setProductoAEliminar(null);
    } catch (err: any) {
      setError(err.message || 'Error al eliminar el producto');
    } finally {
      setIsDeleting(false);
    }
  };

  // ────────────────────────────────────────────────────────────────────────
  // STATS — basadas en todos los productos cargados hasta ahora
  // ────────────────────────────────────────────────────────────────────────

const stats = useMemo(() => ({
  total: totalProductos,
  activos: productos.filter(p => p.activo).length,
  stockBajo: productos.filter(p => p.activo && p.stockActual < p.stockMinimo).length,
  sinStock: productos.filter(p => p.activo && p.stockActual === 0).length,
}), [productos, totalProductos]);

  // ────────────────────────────────────────────────────────────────────────
  // RETURN
  // ────────────────────────────────────────────────────────────────────────

  return {
    productos: productosFiltrados,
    categorias,
    distribuidores,
    stats,
    isLoading,
    cargandoMas,
    hayMas,
    error,
    observerRef,       // ← nuevo, para el trigger del scroll
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
    modalIngreso,
    setModalIngreso,
    ingresarMercaderia,
    productoAEliminar,
    isDeleting,
    confirmarEliminar,
    cancelarEliminar,
    eliminarProducto,
    toggleActivo,
    recargar: () => cargarProductos(1, true),
  };
};