// ════════════════════════════════════════════════════════════════════════════
// HOOK: useCategorias — Lógica de la página de Categorías
// ════════════════════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback, useMemo } from 'react';
import { categoriasApi } from '@/apis';
import { useAuth } from '@/contexts/AuthContext';
import type { Categoria, CreateCategoriaDTO } from '@/types';

// ────────────────────────────────────────────────────────────────────────────
// TYPES
// ────────────────────────────────────────────────────────────────────────────

export type ModalMode = 'crear' | 'editar' | null;

// ────────────────────────────────────────────────────────────────────────────
// HOOK
// ────────────────────────────────────────────────────────────────────────────

export const useCategorias = () => {
  const { user } = useAuth();

  // ── Estado: datos ─────────────────────────────────────────────────────────
  const [categorias, setCategorias]   = useState<Categoria[]>([]);
  const [isLoading, setIsLoading]     = useState(true);
  const [error, setError]             = useState<string | null>(null);

  // ── Estado: búsqueda ──────────────────────────────────────────────────────
  const [busqueda, setBusqueda]       = useState('');

  // ── Estado: modal crear/editar ────────────────────────────────────────────
  const [modalMode, setModalMode]                     = useState<ModalMode>(null);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<Categoria | null>(null);
  const [isSaving, setIsSaving]                       = useState(false);
  const [saveError, setSaveError]                     = useState<string | null>(null);

  // ── Estado: confirmación eliminar ─────────────────────────────────────────
  const [categoriaAEliminar, setCategoriaAEliminar]   = useState<Categoria | null>(null);
  const [isDeleting, setIsDeleting]                   = useState(false);
  const [deleteError, setDeleteError]                 = useState<string | null>(null);

  // ────────────────────────────────────────────────────────────────────────
  // CARGAR DATOS
  // ────────────────────────────────────────────────────────────────────────

  const cargarCategorias = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await categoriasApi.getAll();
      setCategorias(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar las categorías');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarCategorias();
  }, [cargarCategorias]);

  // ────────────────────────────────────────────────────────────────────────
  // FILTRO LOCAL
  // ────────────────────────────────────────────────────────────────────────

  const categoriasFiltradas = useMemo(() => {
    if (!busqueda.trim()) return categorias;
    const q = busqueda.toLowerCase();
    return categorias.filter(c => c.nombre.toLowerCase().includes(q));
  }, [categorias, busqueda]);

  // ────────────────────────────────────────────────────────────────────────
  // STATS
  // ────────────────────────────────────────────────────────────────────────

  const stats = useMemo(() => ({
    total: categorias.length,
    conProductos: categorias.filter(c => (c.cantidadProductos ?? 0) > 0).length,
    sinProductos: categorias.filter(c => (c.cantidadProductos ?? 0) === 0).length,
  }), [categorias]);

  // ────────────────────────────────────────────────────────────────────────
  // ABRIR MODALES
  // ────────────────────────────────────────────────────────────────────────

  const abrirCrear = () => {
    setCategoriaSeleccionada(null);
    setSaveError(null);
    setModalMode('crear');
  };

  const abrirEditar = (categoria: Categoria) => {
    setCategoriaSeleccionada(categoria);
    setSaveError(null);
    setModalMode('editar');
  };

  const cerrarModal = () => {
    setModalMode(null);
    setCategoriaSeleccionada(null);
    setSaveError(null);
  };

  // ────────────────────────────────────────────────────────────────────────
  // GUARDAR (crear o editar)
  // ────────────────────────────────────────────────────────────────────────

  const guardar = async (nombre: string) => {
    if (!nombre.trim()) return;
    setIsSaving(true);
    setSaveError(null);

    try {
      if (modalMode === 'crear') {
        const dto: CreateCategoriaDTO = {
          nombre: nombre.trim(),
          kioscoId: user?.kioscoId,
        };
        await categoriasApi.create(dto);
      } else if (modalMode === 'editar' && categoriaSeleccionada) {
        await categoriasApi.update(categoriaSeleccionada.categoriaID, {
          categoriaID: categoriaSeleccionada.categoriaID,
          nombre: nombre.trim(),
        });
      }
      cerrarModal();
      cargarCategorias();
    } catch (err: any) {
      setSaveError(err.message || 'Error al guardar la categoría');
    } finally {
      setIsSaving(false);
    }
  };

  // ────────────────────────────────────────────────────────────────────────
  // ELIMINAR
  // ────────────────────────────────────────────────────────────────────────

  const confirmarEliminar = (categoria: Categoria) => {
    setDeleteError(null);
    setCategoriaAEliminar(categoria);
  };

  const cancelarEliminar = () => {
    setCategoriaAEliminar(null);
    setDeleteError(null);
  };

  const eliminar = async () => {
    if (!categoriaAEliminar) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await categoriasApi.delete(categoriaAEliminar.categoriaID);
      setCategoriaAEliminar(null);
      cargarCategorias();
    } catch (err: any) {
      setDeleteError(err.message || 'Error al eliminar la categoría');
    } finally {
      setIsDeleting(false);
    }
  };

  // ────────────────────────────────────────────────────────────────────────
  // RETURN
  // ────────────────────────────────────────────────────────────────────────

  return {
    // Datos
    categorias,
    categoriasFiltradas,
    stats,
    isLoading,
    error,

    // Búsqueda
    busqueda,
    setBusqueda,

    // Modal crear/editar
    modalMode,
    categoriaSeleccionada,
    isSaving,
    saveError,
    abrirCrear,
    abrirEditar,
    cerrarModal,
    guardar,

    // Eliminar
    categoriaAEliminar,
    isDeleting,
    deleteError,
    confirmarEliminar,
    cancelarEliminar,
    eliminar,

    // Refresh
    cargarCategorias,
  };
};
