// ════════════════════════════════════════════════════════════════════════════
// HOOK: useEmpleados — Lógica de la página de Empleados
// ════════════════════════════════════════════════════════════════════════════

import { useState, useEffect, useCallback, useMemo } from 'react';
import { empleadosApi, permisosApi, authApi } from '@/apis';
import { useAuth } from '@/contexts/AuthContext';
import type {
  Empleado,
  CreateEmpleadoDTO,
  UpdateEmpleadoDTO,
  Permiso,
  EmpleadoConPermisos,
  PlantillaRol,
  PlantillaCustom,
} from '@/types';

const STORAGE_KEY_PLANTILLAS = 'kiosconeta_plantillas_custom';

// ────────────────────────────────────────────────────────────────────────────
// TYPES
// ────────────────────────────────────────────────────────────────────────────

export type ModalMode = 'crear' | 'editar' | null;

// ────────────────────────────────────────────────────────────────────────────
// HOOK
// ────────────────────────────────────────────────────────────────────────────

export const useEmpleados = () => {
  const { user } = useAuth();

  // ── Datos ─────────────────────────────────────────────────────────────────
  const [empleados, setEmpleados]           = useState<Empleado[]>([]);
  const [todosPermisos, setTodosPermisos]   = useState<Permiso[]>([]);
  const [plantillas, setPlantillas]         = useState<PlantillaRol[]>([]);
  const [plantillasCustom, setPlantillasCustom] = useState<PlantillaCustom[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_PLANTILLAS);
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });
  const [showModalPlantillas, setShowModalPlantillas] = useState(false);
  const [isLoading, setIsLoading]           = useState(true);
  const [error, setError]                   = useState<string | null>(null);

  // ── Búsqueda / filtros ────────────────────────────────────────────────────
  const [busqueda, setBusqueda]             = useState('');
  const [filtroActivo, setFiltroActivo]     = useState<'todos' | 'activos' | 'inactivos'>('activos');

  // ── Modal crear / editar ──────────────────────────────────────────────────
  const [modalMode, setModalMode]                       = useState<ModalMode>(null);
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState<Empleado | null>(null);
  const [isSaving, setIsSaving]                         = useState(false);
  const [saveError, setSaveError]                       = useState<string | null>(null);

  // ── Modal permisos ────────────────────────────────────────────────────────
  const [empleadoPermisos, setEmpleadoPermisos]         = useState<EmpleadoConPermisos | null>(null);
  const [showModalPermisos, setShowModalPermisos]       = useState(false);
  const [permisosSeleccionados, setPermisosSeleccionados] = useState<number[]>([]);
  const [isSavingPermisos, setIsSavingPermisos]         = useState(false);
  const [errorPermisos, setErrorPermisos]               = useState<string | null>(null);
  const [isLoadingPermisos, setIsLoadingPermisos]       = useState(false);

  // ── Modal PIN ─────────────────────────────────────────────────────────────
  const [empleadoPin, setEmpleadoPin]       = useState<Empleado | null>(null);
  const [showModalPin, setShowModalPin]     = useState(false);
  const [nuevoPin, setNuevoPin]             = useState('');
  const [isSavingPin, setIsSavingPin]       = useState(false);
  const [errorPin, setErrorPin]             = useState<string | null>(null);

  // ── Toggle activo ─────────────────────────────────────────────────────────
  const [isTogglingId, setIsTogglingId]     = useState<number | null>(null);

  // ────────────────────────────────────────────────────────────────────────
  // CARGAR DATOS
  // ────────────────────────────────────────────────────────────────────────

  const cargarEmpleados = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [emps, perms, plants] = await Promise.all([
        empleadosApi.getByKiosco(user!.kioscoId),
        permisosApi.getAll(),
        permisosApi.getPlantillas(),
      ]);
      setEmpleados(emps);
      setTodosPermisos(perms);
      setPlantillas(plants);
    } catch (err: any) {
      setError(err.message || 'Error al cargar empleados');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarEmpleados();
  }, [cargarEmpleados]);

  // ────────────────────────────────────────────────────────────────────────
  // FILTRADO LOCAL
  // ────────────────────────────────────────────────────────────────────────

  const empleadosFiltrados = useMemo(() => {
    let lista = [...empleados];
    if (filtroActivo === 'activos')   lista = lista.filter(e => e.activo);
    if (filtroActivo === 'inactivos') lista = lista.filter(e => !e.activo);
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      lista = lista.filter(e =>
        e.nombre.toLowerCase().includes(q) ||
        e.legajo?.toLowerCase().includes(q) ||
        e.telefono?.toLowerCase().includes(q)
      );
    }
    return lista;
  }, [empleados, filtroActivo, busqueda]);

  // ────────────────────────────────────────────────────────────────────────
  // STATS
  // ────────────────────────────────────────────────────────────────────────

  const stats = useMemo(() => ({
    total:     empleados.length,
    activos:   empleados.filter(e => e.activo).length,
    inactivos: empleados.filter(e => !e.activo).length,
    admins:    empleados.filter(e => e.esAdmin || e.usuarioID != null).length,
  }), [empleados]);

  // ────────────────────────────────────────────────────────────────────────
  // MODAL CREAR / EDITAR
  // ────────────────────────────────────────────────────────────────────────

  const abrirCrear = () => {
    setEmpleadoSeleccionado(null);
    setSaveError(null);
    setModalMode('crear');
  };

  const abrirEditar = (empleado: Empleado) => {
    setEmpleadoSeleccionado(empleado);
    setSaveError(null);
    setModalMode('editar');
  };

  const cerrarModal = () => {
    setModalMode(null);
    setEmpleadoSeleccionado(null);
    setSaveError(null);
  };

  const guardar = async (data: CreateEmpleadoDTO | UpdateEmpleadoDTO) => {
    setIsSaving(true);
    setSaveError(null);
    try {
      if (modalMode === 'crear') {
        await empleadosApi.create(data as CreateEmpleadoDTO);
      } else if (modalMode === 'editar' && empleadoSeleccionado) {
        const dto = data as UpdateEmpleadoDTO;
        await empleadosApi.update(empleadoSeleccionado.empleadoId, {
          empleadoId: empleadoSeleccionado.empleadoId,
          nombre:     dto.nombre,
          activo:     dto.activo ?? empleadoSeleccionado.activo, // nunca undefined
        });
      }
      cerrarModal();
      cargarEmpleados();
    } catch (err: any) {
      setSaveError(err.message || 'Error al guardar el empleado');
    } finally {
      setIsSaving(false);
    }
  };

  // ────────────────────────────────────────────────────────────────────────
  // TOGGLE ACTIVO
  // ────────────────────────────────────────────────────────────────────────

  const toggleActivo = async (empleado: Empleado) => {
    setIsTogglingId(empleado.empleadoId);
    try {
      await empleadosApi.update(empleado.empleadoId, {
        empleadoId: empleado.empleadoId,
        nombre:     empleado.nombre,
        activo:     !empleado.activo,
      });
      cargarEmpleados();
    } catch (err: any) {
      setError(err.message || 'Error al cambiar el estado del empleado');
    } finally {
      setIsTogglingId(null);
    }
  };

  // ────────────────────────────────────────────────────────────────────────
  // MODAL PERMISOS
  // ────────────────────────────────────────────────────────────────────────

  const abrirPermisos = async (empleado: Empleado) => {
    setErrorPermisos(null);
    setIsLoadingPermisos(true);
    setShowModalPermisos(true);
    try {
      const data = await permisosApi.getByEmpleado(empleado.empleadoId);
      setEmpleadoPermisos(data);
      setPermisosSeleccionados(data.permisos.map(p => (p as any).permisoID ?? p.permisoId));
    } catch (err: any) {
      setErrorPermisos(err.message || 'Error al cargar permisos');
    } finally {
      setIsLoadingPermisos(false);
    }
  };

  const cerrarPermisos = () => {
    setShowModalPermisos(false);
    setEmpleadoPermisos(null);
    setPermisosSeleccionados([]);
    setErrorPermisos(null);
  };

  const togglePermiso = (permisoId: number) => {
    setPermisosSeleccionados(prev =>
      prev.includes(permisoId)
        ? prev.filter(id => id !== permisoId)
        : [...prev, permisoId]
    );
  };

  const aplicarPlantilla = (permisosIds: number[]) => {
    setPermisosSeleccionados(permisosIds);
  };

  const guardarPermisos = async () => {
    if (!empleadoPermisos) return;
    setIsSavingPermisos(true);
    setErrorPermisos(null);
    try {
      await permisosApi.reemplazar({
        empleadoId: empleadoPermisos.empleadoId,
        permisosIds: permisosSeleccionados,
      });
      cerrarPermisos();
    } catch (err: any) {
      setErrorPermisos(err.message || 'Error al guardar permisos');
    } finally {
      setIsSavingPermisos(false);
    }
  };

  // ────────────────────────────────────────────────────────────────────────
  // MODAL PIN
  // ────────────────────────────────────────────────────────────────────────

  const abrirPin = (empleado: Empleado) => {
    setEmpleadoPin(empleado);
    setNuevoPin('');
    setErrorPin(null);
    setShowModalPin(true);
  };

  const cerrarPin = () => {
    setShowModalPin(false);
    setEmpleadoPin(null);
    setNuevoPin('');
    setErrorPin(null);
  };

  const guardarPin = async () => {
    if (!empleadoPin || nuevoPin.length < 4) return;
    setIsSavingPin(true);
    setErrorPin(null);
    try {
      await authApi.asignarPin(empleadoPin.empleadoId, nuevoPin);
      cerrarPin();
    } catch (err: any) {
      setErrorPin(err.message || 'Error al asignar el PIN');
    } finally {
      setIsSavingPin(false);
    }
  };

  // ────────────────────────────────────────────────────────────────────────
  // PLANTILLAS CUSTOM
  // ────────────────────────────────────────────────────────────────────────

  const guardarPlantillasCustom = (nuevas: PlantillaCustom[]) => {
    setPlantillasCustom(nuevas);
    localStorage.setItem(STORAGE_KEY_PLANTILLAS, JSON.stringify(nuevas));
  };

  const crearPlantillaCustom = (nombre: string, descripcion: string, permisosIds: number[]) => {
    const nueva: PlantillaCustom = {
      id: Date.now().toString(),
      nombre: nombre.trim(),
      descripcion: descripcion.trim() || undefined,
      permisosIds,
      creadaEn: new Date().toISOString(),
    };
    guardarPlantillasCustom([...plantillasCustom, nueva]);
  };

  const editarPlantillaCustom = (id: string, nombre: string, descripcion: string, permisosIds: number[]) => {
    guardarPlantillasCustom(
      plantillasCustom.map(p =>
        p.id === id ? { ...p, nombre: nombre.trim(), descripcion: descripcion.trim() || undefined, permisosIds } : p
      )
    );
  };

  const eliminarPlantillaCustom = (id: string) => {
    guardarPlantillasCustom(plantillasCustom.filter(p => p.id !== id));
  };

  // ────────────────────────────────────────────────────────────────────────
  // RETURN
  // ────────────────────────────────────────────────────────────────────────

  return {
    // Datos
    empleadosFiltrados,
    todosPermisos,
    plantillas,
    stats,
    isLoading,
    error,

    // Filtros
    busqueda,
    setBusqueda,
    filtroActivo,
    setFiltroActivo,

    // Modal crear/editar
    modalMode,
    empleadoSeleccionado,
    isSaving,
    saveError,
    abrirCrear,
    abrirEditar,
    cerrarModal,
    guardar,

    // Toggle activo
    isTogglingId,
    toggleActivo,

    // Modal permisos
    showModalPermisos,
    empleadoPermisos,
    permisosSeleccionados,
    isSavingPermisos,
    isLoadingPermisos,
    errorPermisos,
    abrirPermisos,
    cerrarPermisos,
    togglePermiso,
    aplicarPlantilla,
    guardarPermisos,

    // Modal PIN
    showModalPin,
    empleadoPin,
    nuevoPin,
    setNuevoPin,
    isSavingPin,
    errorPin,
    abrirPin,
    cerrarPin,
    guardarPin,

    // Plantillas custom
    plantillasCustom,
    showModalPlantillas,
    setShowModalPlantillas,
    crearPlantillaCustom,
    editarPlantillaCustom,
    eliminarPlantillaCustom,

    // Refresh
    cargarEmpleados,
  };
};
