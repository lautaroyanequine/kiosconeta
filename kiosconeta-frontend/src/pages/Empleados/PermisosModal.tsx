// ════════════════════════════════════════════════════════════════════════════
// COMPONENT: PermisosModal — Ver y gestionar permisos de un empleado
// ════════════════════════════════════════════════════════════════════════════

import React, { useMemo } from 'react';
import { AlertCircle, ShieldCheck, Zap } from 'lucide-react';
import { Modal, Button } from '@/components/commons';
import type { EmpleadoConPermisos, Permiso, PlantillaRol } from '@/types';

// ────────────────────────────────────────────────────────────────────────────
// TYPES
// ────────────────────────────────────────────────────────────────────────────

interface PermisosModalProps {
  isOpen: boolean;
  empleado: EmpleadoConPermisos | null;
  todosPermisos: Permiso[];
  permisosSeleccionados: number[];
  plantillas: PlantillaRol[];
  isSaving: boolean;
  isLoading: boolean;
  error: string | null;
  onClose: () => void;
  onToggle: (permisoId: number) => void;
  onAplicarPlantilla: (permisos: Permiso[]) => void;
  onGuardar: () => void;
}

// ────────────────────────────────────────────────────────────────────────────
// HELPERS
// ────────────────────────────────────────────────────────────────────────────

// Etiquetas legibles para cada categoría de permiso
const CATEGORIA_LABELS: Record<string, string> = {
  productos: '📦 Productos',
  ventas:    '💰 Ventas',
  gastos:    '💸 Gastos',
  turnos:    '🕐 Turnos',
  empleados: '👥 Empleados',
  reportes:  '📊 Reportes',
  configuracion: '⚙️ Configuración',
};

// Etiqueta legible para cada permiso individual
const PERMISO_LABELS: Record<string, string> = {
  'productos.ver':      'Ver productos',
  'productos.crear':    'Crear productos',
  'productos.editar':   'Editar productos',
  'productos.eliminar': 'Eliminar productos',
  'ventas.crear':       'Registrar ventas',
  'ventas.ver_todas':   'Ver todas las ventas',
  'ventas.ver_propias': 'Ver ventas propias',
  'ventas.anular':      'Anular ventas',
  'gastos.crear':       'Registrar gastos',
  'gastos.ver_todos':   'Ver todos los gastos',
  'gastos.ver_propios': 'Ver gastos propios',
  'turnos.abrir':       'Abrir turnos',
  'turnos.cerrar':      'Cerrar turnos',
  'turnos.ver_todos':   'Ver historial de turnos',
  'empleados.ver':                'Ver empleados',
  'empleados.crear':              'Crear empleados',
  'empleados.editar':             'Editar empleados',
  'empleados.asignar_permisos':   'Asignar permisos',
  'reportes.dashboard_completo':  'Dashboard completo',
  'reportes.dashboard_basico':    'Dashboard básico',
  'configuracion.kiosco':         'Configuración del kiosco',
};

// ════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ════════════════════════════════════════════════════════════════════════════

export const PermisosModal: React.FC<PermisosModalProps> = ({
  isOpen,
  empleado,
  todosPermisos,
  permisosSeleccionados,
  plantillas,
  isSaving,
  isLoading,
  error,
  onClose,
  onToggle,
  onAplicarPlantilla,
  onGuardar,
}) => {
  // Agrupar permisos por categoría
  const permisosPorCategoria = useMemo(() => {
    const grupos: Record<string, Permiso[]> = {};
    (todosPermisos ?? []).forEach(p => {
      const cat = p.categoria || p.nombre.split('.')[0] || 'otros';
      if (!grupos[cat]) grupos[cat] = [];
      grupos[cat].push(p);
    });
    return grupos;
  }, [todosPermisos]);

  const cantidadSeleccionados = (permisosSeleccionados ?? []).length;
  const cantidadTotal = (todosPermisos ?? []).length;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Permisos — ${empleado?.nombre ?? ''}`}
      size="lg"
      footer={
        <>
          <span className="text-xs text-neutral-400 mr-auto">
            {cantidadSeleccionados} de {cantidadTotal} permisos seleccionados
          </span>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={onGuardar} loading={isSaving}>
            Guardar permisos
          </Button>
        </>
      }
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-5">

          {error && (
            <div className="flex items-center gap-2 p-3 bg-danger-50 border border-danger-100
                            rounded-xl text-sm text-danger">
              <AlertCircle size={15} className="shrink-0" />
              {error}
            </div>
          )}

          {/* Plantillas de rol */}
          {(plantillas ?? []).length > 0 && (
            <div>
              <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <Zap size={12} />
                Aplicar plantilla de rol
              </p>
              <div className="flex flex-wrap gap-2">
                {(plantillas ?? []).map(p => (
                  <button
                    key={p.rol}
                    onClick={() => onAplicarPlantilla(p.permisos ?? [])}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg border border-neutral-300
                               text-neutral-600 hover:border-primary hover:text-primary
                               hover:bg-primary/5 transition-all"
                  >
                    {p.rol}
                    <span className="ml-1.5 text-neutral-400">({(p.permisos ?? []).length})</span>
                  </button>
                ))}
                <button
                  onClick={() => onAplicarPlantilla([])}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg border border-neutral-300
                             text-neutral-400 hover:border-danger hover:text-danger
                             hover:bg-danger-50 transition-all"
                >
                  Sin permisos
                </button>
              </div>
            </div>
          )}

          {/* Permisos por categoría */}
          <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
            {Object.entries(permisosPorCategoria).map(([categoria, permisos]) => (
              <div key={categoria}>
                <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">
                  {CATEGORIA_LABELS[categoria] ?? categoria}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {permisos.map(permiso => {
                    const activo = permisosSeleccionados.includes(permiso.permisoId);
                    return (
                      <label
                        key={permiso.permisoId}
                        className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer
                                    transition-all select-none
                                    ${activo
                                      ? 'border-primary bg-primary/5'
                                      : 'border-neutral-200 hover:border-neutral-300'}`}
                      >
                        <input
                          type="checkbox"
                          checked={activo}
                          onChange={() => onToggle(permiso.permisoId)}
                          className="hidden"
                        />
                        <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center
                                         shrink-0 transition-all
                                         ${activo
                                           ? 'border-primary bg-primary'
                                           : 'border-neutral-300'}`}>
                          {activo && (
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className={`text-sm font-medium truncate
                                         ${activo ? 'text-primary' : 'text-neutral-700'}`}>
                            {PERMISO_LABELS[permiso.nombre] ?? permiso.nombre}
                          </p>
                          {permiso.descripcion && (
                            <p className="text-xs text-neutral-400 truncate">{permiso.descripcion}</p>
                          )}
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Modal>
  );
};
