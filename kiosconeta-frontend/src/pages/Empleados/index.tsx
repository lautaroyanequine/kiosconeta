// ════════════════════════════════════════════════════════════════════════════
// PAGE: Empleados — ABM + permisos + PIN
// ════════════════════════════════════════════════════════════════════════════

import React from 'react';
import {
  Plus, Search, RefreshCw, Pencil, Users,
  UserCheck, UserX, ShieldCheck, KeyRound,
  ToggleLeft, ToggleRight, AlertCircle, Crown,
} from 'lucide-react';
import { Button, Badge, Modal, LoadingOverlay } from '@/components/commons';
import { EmpleadoModal } from './EmpleadoModal';
import { PermisosModal } from './PermisosModal';
import { useEmpleados } from './useEmpleados';
import type { Empleado } from '@/types';

// ────────────────────────────────────────────────────────────────────────────
// STAT CARD
// ────────────────────────────────────────────────────────────────────────────

const StatCard: React.FC<{
  label: string; value: number;
  icon: React.ReactNode; color: string;
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

// ════════════════════════════════════════════════════════════════════════════
// PAGE COMPONENT
// ════════════════════════════════════════════════════════════════════════════

const EmpleadosPage: React.FC = () => {
  const {
    empleadosFiltrados,
    todosPermisos,
    plantillas,
    plantillasCustom,
    stats,
    isLoading,
    error,
    busqueda, setBusqueda,
    filtroActivo, setFiltroActivo,
    modalMode,
    empleadoSeleccionado,
    isSaving, saveError,
    abrirCrear, abrirEditar, cerrarModal, guardar,
    isTogglingId, toggleActivo,
    showModalPermisos,
    empleadoPermisos,
    permisosSeleccionados,
    isSavingPermisos, isLoadingPermisos, errorPermisos,
    abrirPermisos, cerrarPermisos,
    togglePermiso, aplicarPlantilla, guardarPermisos,
    crearPlantillaCustom,
    editarPlantillaCustom,
    eliminarPlantillaCustom,
    showModalPin,
    empleadoPin,
    nuevoPin, setNuevoPin,
    isSavingPin, errorPin,
    abrirPin, cerrarPin, guardarPin,
    cargarEmpleados,
  } = useEmpleados();

  return (
    <div className="h-full flex flex-col bg-neutral-50">

      {isLoading && <LoadingOverlay message="Cargando empleados..." />}

      {/* ── Header ── */}
      <div className="bg-white border-b border-neutral-200 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-neutral-900">Empleados</h1>
            <p className="text-sm text-neutral-500 mt-0.5">Gestión del equipo y permisos</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" leftIcon={<RefreshCw size={15} />}
              onClick={cargarEmpleados} disabled={isLoading}>
              Actualizar
            </Button>
            <Button variant="primary" leftIcon={<Plus size={16} />} onClick={abrirCrear}>
              Nuevo empleado
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="Total" value={stats.total}
            icon={<Users size={20} className="text-primary" />} color="bg-primary/10" />
          <StatCard label="Activos" value={stats.activos}
            icon={<UserCheck size={20} className="text-success" />} color="bg-success-50" />
          <StatCard label="Inactivos" value={stats.inactivos}
            icon={<UserX size={20} className="text-neutral-400" />} color="bg-neutral-100" />
          <StatCard label="Administradores" value={stats.admins}
            icon={<Crown size={20} className="text-warning-600" />} color="bg-warning-50" />
        </div>
      </div>

      {/* ── Filtros ── */}
      <div className="px-6 py-3 bg-white border-b border-neutral-200 flex items-center gap-4 flex-wrap">
        {/* Búsqueda */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text" value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre o legajo..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-neutral-300 text-sm
                       outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>

        {/* Filtro activo/inactivo */}
        <div className="flex rounded-lg border border-neutral-300 overflow-hidden text-sm">
          {(['activos', 'todos', 'inactivos'] as const).map(op => (
            <button key={op} onClick={() => setFiltroActivo(op)}
              className={`px-4 py-2 font-medium transition-all capitalize
                ${filtroActivo === op ? 'bg-primary text-white' : 'text-neutral-600 hover:bg-neutral-50'}`}>
              {op}
            </button>
          ))}
        </div>
      </div>

      {/* ── Contenido ── */}
      <div className="flex-1 overflow-auto px-6 py-4">

        {error && (
          <div className="flex items-center gap-2 p-4 bg-danger-50 border border-danger-100
                          rounded-xl text-sm text-danger mb-4">
            <AlertCircle size={16} className="shrink-0" /> {error}
          </div>
        )}

        {!isLoading && empleadosFiltrados.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-neutral-400">
            <Users size={48} className="mb-3 opacity-30" />
            <p className="text-sm">
              {busqueda ? 'No se encontraron empleados con esa búsqueda'
                        : 'No hay empleados todavía.'}
            </p>
            {!busqueda && (
              <button onClick={abrirCrear}
                className="mt-3 text-sm text-primary font-medium hover:underline">
                + Nuevo empleado
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-200">
                  <th className="text-left px-4 py-3 font-semibold text-neutral-600 text-xs uppercase tracking-wide">Empleado</th>
                  <th className="text-left px-4 py-3 font-semibold text-neutral-600 text-xs uppercase tracking-wide">Legajo</th>
                  <th className="text-left px-4 py-3 font-semibold text-neutral-600 text-xs uppercase tracking-wide">Teléfono</th>
                  <th className="text-center px-4 py-3 font-semibold text-neutral-600 text-xs uppercase tracking-wide">Rol</th>
                  <th className="text-center px-4 py-3 font-semibold text-neutral-600 text-xs uppercase tracking-wide">Estado</th>
                  <th className="text-center px-4 py-3 font-semibold text-neutral-600 text-xs uppercase tracking-wide">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {empleadosFiltrados.map(emp => (
                  <EmpleadoRow
                    key={emp.empleadoId}
                    empleado={emp}
                    isToggling={isTogglingId === emp.empleadoId}
                    onEditar={() => abrirEditar(emp)}
                    onToggle={() => toggleActivo(emp)}
                    onPermisos={() => abrirPermisos(emp)}
                    onPin={() => abrirPin(emp)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Modal: Crear / Editar ── */}
      <EmpleadoModal
        mode={modalMode}
        empleado={empleadoSeleccionado}
        isSaving={isSaving}
        saveError={saveError}
        onClose={cerrarModal}
        onGuardar={guardar}
      />

      {/* ── Modal: Permisos ── */}
      <PermisosModal
        isOpen={showModalPermisos}
        empleado={empleadoPermisos}
        todosPermisos={todosPermisos}
        permisosSeleccionados={permisosSeleccionados}
        plantillasSistema={plantillas}
        plantillasCustom={plantillasCustom}
        isSaving={isSavingPermisos}
        isLoading={isLoadingPermisos}
        error={errorPermisos}
        onClose={cerrarPermisos}
        onToggle={togglePermiso}
        onAplicarPlantilla={aplicarPlantilla}
        onGuardar={guardarPermisos}
        onCrearPlantilla={crearPlantillaCustom}
        onEditarPlantilla={editarPlantillaCustom}
        onEliminarPlantilla={eliminarPlantillaCustom}
      />

      {/* ── Modal: PIN ── */}
      <Modal
        isOpen={showModalPin}
        onClose={cerrarPin}
        title={`Asignar PIN — ${empleadoPin?.nombre ?? ''}`}
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={cerrarPin} disabled={isSavingPin}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={guardarPin}
              loading={isSavingPin}
              disabled={nuevoPin.length < 4}
            >
              Asignar PIN
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-neutral-600">
            Ingresá el nuevo PIN para{' '}
            <span className="font-semibold">{empleadoPin?.nombre}</span>.
            El empleado lo usará para ingresar al sistema.
          </p>

          {/* Input PIN con dígitos grandes */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              Nuevo PIN <span className="text-neutral-400 font-normal">(4 a 6 dígitos)</span>
            </label>
            <input
              type="password"
              inputMode="numeric"
              value={nuevoPin}
              onChange={e => setNuevoPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="••••"
              maxLength={6}
              autoFocus
              className="w-full px-4 py-3 rounded-xl border border-neutral-300 text-center
                         text-2xl font-bold tracking-widest outline-none
                         focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
            <p className="text-xs text-neutral-400 mt-1 text-center">
              {nuevoPin.length}/6 dígitos
            </p>
          </div>

          {errorPin && (
            <div className="flex items-center gap-2 p-3 bg-danger-50 border border-danger-100
                            rounded-xl text-sm text-danger">
              <AlertCircle size={15} className="shrink-0" /> {errorPin}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

// ────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTE: EmpleadoRow
// ────────────────────────────────────────────────────────────────────────────

const EmpleadoRow: React.FC<{
  empleado: Empleado;
  isToggling: boolean;
  onEditar: () => void;
  onToggle: () => void;
  onPermisos: () => void;
  onPin: () => void;
}> = ({ empleado, isToggling, onEditar, onToggle, onPermisos, onPin }) => (
  <tr className={`hover:bg-neutral-50 transition-colors ${!empleado.activo ? 'opacity-60' : ''}`}>

    {/* Nombre */}
    <td className="px-4 py-3">
      <div className="flex items-center gap-2.5">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0
                         ${(empleado.esAdmin || empleado.usuarioID != null) ? 'bg-warning-100 text-warning-700' : 'bg-primary/10 text-primary'}`}>
          {empleado.nombre.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-semibold text-neutral-800">{empleado.nombre}</p>
          {(empleado.esAdmin || empleado.usuarioID != null) && (
            <p className="text-xs text-warning-600 flex items-center gap-0.5">
              <Crown size={10} /> Admin
            </p>
          )}
        </div>
      </div>
    </td>

    {/* Legajo */}
    <td className="px-4 py-3 text-neutral-500">
      {empleado.legajo ?? <span className="text-neutral-300">—</span>}
    </td>

    {/* Teléfono */}
    <td className="px-4 py-3 text-neutral-500">
      {empleado.telefono ?? <span className="text-neutral-300">—</span>}
    </td>

    {/* Rol */}
    <td className="px-4 py-3 text-center">
      {(empleado.esAdmin || empleado.usuarioID != null)
        ? <Badge variant="warning">Admin</Badge>
        : <Badge variant="neutral">Empleado</Badge>}
    </td>

    {/* Estado */}
    <td className="px-4 py-3 text-center">
      {empleado.activo
        ? <Badge variant="success" dot>Activo</Badge>
        : <Badge variant="danger" dot>Inactivo</Badge>}
    </td>

    {/* Acciones */}
    <td className="px-4 py-3">
      <div className="flex items-center justify-center gap-1">

        {/* Editar */}
        <button onClick={onEditar} title="Editar"
          className="p-1.5 rounded-lg text-neutral-400 hover:text-primary
                     hover:bg-primary/10 transition-all">
          <Pencil size={15} />
        </button>

        {/* Permisos — solo si no es admin */}
        {!empleado.esAdmin && empleado.usuarioID == null && (
          <button onClick={onPermisos} title="Gestionar permisos"
            className="p-1.5 rounded-lg text-neutral-400 hover:text-primary
                       hover:bg-primary/10 transition-all">
            <ShieldCheck size={15} />
          </button>
        )}

        {/* Asignar PIN */}
        <button onClick={onPin} title="Asignar PIN"
          className="p-1.5 rounded-lg text-neutral-400 hover:text-primary
                     hover:bg-primary/10 transition-all">
          <KeyRound size={15} />
        </button>

        {/* Toggle activo */}
        <button onClick={onToggle} disabled={isToggling}
          title={empleado.activo ? 'Desactivar' : 'Activar'}
          className={`p-1.5 rounded-lg transition-all
            ${isToggling ? 'opacity-50 cursor-not-allowed' : ''}
            ${empleado.activo
              ? 'text-success hover:text-danger hover:bg-danger-50'
              : 'text-neutral-400 hover:text-success hover:bg-success-50'}`}>
          {empleado.activo
            ? <ToggleRight size={18} />
            : <ToggleLeft size={18} />}
        </button>
      </div>
    </td>
  </tr>
);

export default EmpleadosPage;
