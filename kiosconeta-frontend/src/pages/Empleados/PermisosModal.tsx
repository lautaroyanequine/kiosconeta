// ════════════════════════════════════════════════════════════════════════════
// COMPONENT: PermisosModal — Ver y gestionar permisos de un empleado
// Plantillas del sistema (fijas) + plantillas custom del admin (editables)
// ════════════════════════════════════════════════════════════════════════════

import React, { useMemo, useState } from 'react';
import { AlertCircle, Shield, BookMarked, Plus, Pencil, Trash2, Save, X } from 'lucide-react';
import { Modal, Button } from '@/components/commons';
import type { EmpleadoConPermisos, Permiso, PlantillaRol, PlantillaCustom } from '@/types';

interface PermisosModalProps {
  isOpen: boolean;
  empleado: EmpleadoConPermisos | null;
  todosPermisos: Permiso[];
  permisosSeleccionados: number[];
  plantillasSistema: PlantillaRol[];
  plantillasCustom: PlantillaCustom[];
  isSaving: boolean;
  isLoading: boolean;
  error: string | null;
  onClose: () => void;
  onToggle: (permisoId: number) => void;
  onAplicarPlantilla: (permisosIds: number[]) => void;
  onGuardar: () => void;
  onCrearPlantilla: (nombre: string, descripcion: string, permisosIds: number[]) => void;
  onEditarPlantilla: (id: string, nombre: string, descripcion: string, permisosIds: number[]) => void;
  onEliminarPlantilla: (id: string) => void;
}

const CATEGORIA_LABELS: Record<string, string> = {
  productos: '📦 Productos', ventas: '💰 Ventas', gastos: '💸 Gastos',
  turnos: '🕐 Turnos', empleados: '👥 Empleados', reportes: '📊 Reportes',
  configuracion: '⚙️ Configuración', categorias: '🏷️ Categorías', metodos_pago: '💳 Métodos de pago',
};

const ROL_COLORS: Record<string, string> = {
  Admin:     'bg-danger-50 text-danger border-danger-200',
  Gerente:   'bg-warning-50 text-warning-700 border-warning-200',
  Cajero:    'bg-primary/10 text-primary border-primary/20',
  Repositor: 'bg-success-50 text-success border-success-200',
};

export const PermisosModal: React.FC<PermisosModalProps> = ({
  isOpen, empleado, todosPermisos, permisosSeleccionados,
  plantillasSistema, plantillasCustom, isSaving, isLoading, error,
  onClose, onToggle, onAplicarPlantilla, onGuardar,
  onCrearPlantilla, onEditarPlantilla, onEliminarPlantilla,
}) => {
  const [editorMode, setEditorMode]       = useState<'crear' | 'editar' | null>(null);
  const [editorId, setEditorId]           = useState<string | null>(null);
  const [editorNombre, setEditorNombre]   = useState('');
  const [editorDesc, setEditorDesc]       = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const permisosPorCategoria = useMemo(() => {
    const grupos: Record<string, Permiso[]> = {};
    (todosPermisos ?? []).forEach(p => {
      const cat = p.categoria || p.nombre.split('.')[0] || 'otros';
      if (!grupos[cat]) grupos[cat] = [];
      grupos[cat].push(p);
    });
    return grupos;
  }, [todosPermisos]);

  const abrirCrearPlantilla = () => {
    setEditorMode('crear'); setEditorId(null); setEditorNombre(''); setEditorDesc('');
  };

  const abrirEditarPlantilla = (p: PlantillaCustom) => {
    setEditorMode('editar'); setEditorId(p.id);
    setEditorNombre(p.nombre); setEditorDesc(p.descripcion ?? '');
    onAplicarPlantilla(p.permisosIds);
  };

  const cerrarEditor = () => {
    setEditorMode(null); setEditorId(null); setEditorNombre(''); setEditorDesc('');
  };

  const guardarPlantillaCustom = () => {
    if (!editorNombre.trim()) return;
    if (editorMode === 'crear') onCrearPlantilla(editorNombre, editorDesc, permisosSeleccionados);
    else if (editorMode === 'editar' && editorId) onEditarPlantilla(editorId, editorNombre, editorDesc, permisosSeleccionados);
    cerrarEditor();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Permisos — ${empleado?.nombre ?? ''}`} size="xl"
      footer={
        <>
          <span className="text-xs text-neutral-400 mr-auto">
            {(permisosSeleccionados ?? []).length} de {(todosPermisos ?? []).length} seleccionados
          </span>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>Cancelar</Button>
          <Button variant="primary" onClick={onGuardar} loading={isSaving}>Guardar permisos</Button>
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
            <div className="flex items-center gap-2 p-3 bg-danger-50 border border-danger-100 rounded-xl text-sm text-danger">
              <AlertCircle size={15} className="shrink-0" /> {error}
            </div>
          )}

          {/* ── Plantillas del sistema ── */}
          <div>
            <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <Shield size={12} /> Plantillas del sistema
            </p>
            <div className="flex flex-wrap gap-2">
              {(plantillasSistema ?? []).map(p => (
                <button key={p.rol} onClick={() => onAplicarPlantilla(p.permisosIds ?? [])}
                  title={p.descripcion}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all hover:opacity-80
                              ${ROL_COLORS[p.rol] ?? 'bg-neutral-100 text-neutral-600 border-neutral-300'}`}>
                  {p.rol} <span className="opacity-60 ml-1">({(p.permisosIds ?? []).length})</span>
                </button>
              ))}
              <button onClick={() => onAplicarPlantilla([])}
                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-neutral-300
                           text-neutral-400 hover:border-danger hover:text-danger hover:bg-danger-50 transition-all">
                Sin permisos
              </button>
            </div>
          </div>

          {/* ── Plantillas custom ── */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wide flex items-center gap-1.5">
                <BookMarked size={12} /> Mis plantillas
              </p>
              {editorMode === null && (
                <button onClick={abrirCrearPlantilla}
                  className="flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                  <Plus size={12} /> Nueva plantilla
                </button>
              )}
            </div>

            {/* Editor inline */}
            {editorMode !== null && (
              <div className="p-3 bg-primary/5 border border-primary/20 rounded-xl mb-3 space-y-2">
                <p className="text-xs font-semibold text-primary">
                  {editorMode === 'crear' ? 'Nueva plantilla' : 'Editar plantilla'}
                  <span className="font-normal text-neutral-500 ml-1">
                    — se guardan los permisos seleccionados abajo
                  </span>
                </p>
                <div className="flex gap-2">
                  <input type="text" value={editorNombre} onChange={e => setEditorNombre(e.target.value)}
                    placeholder="Nombre *" autoFocus
                    className="flex-1 px-3 py-1.5 rounded-lg border border-neutral-300 text-sm outline-none
                               focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                  <input type="text" value={editorDesc} onChange={e => setEditorDesc(e.target.value)}
                    placeholder="Descripción (opcional)"
                    className="flex-1 px-3 py-1.5 rounded-lg border border-neutral-300 text-sm outline-none
                               focus:ring-2 focus:ring-primary/30 focus:border-primary" />
                </div>
                <div className="flex gap-2 justify-end">
                  <button onClick={cerrarEditor}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg border
                               border-neutral-300 text-neutral-500 hover:bg-neutral-50">
                    <X size={12} /> Cancelar
                  </button>
                  <button onClick={guardarPlantillaCustom} disabled={!editorNombre.trim()}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg bg-primary
                               text-white disabled:opacity-40 hover:bg-primary-600">
                    <Save size={12} />
                    {editorMode === 'crear' ? 'Crear con permisos actuales' : 'Guardar cambios'}
                  </button>
                </div>
              </div>
            )}

            {/* Lista custom */}
            {plantillasCustom.length === 0 && editorMode === null ? (
              <p className="text-xs text-neutral-400 italic">Todavía no hay plantillas personalizadas.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {plantillasCustom.map(p => (
                  <div key={p.id}
                    className="flex items-center gap-1 pl-3 pr-1 py-1 rounded-lg border border-neutral-200 bg-white text-xs text-neutral-700">
                    <button onClick={() => onAplicarPlantilla(p.permisosIds)}
                      className="font-medium hover:text-primary transition-colors" title={p.descripcion}>
                      {p.nombre}
                    </button>
                    <span className="text-neutral-400 mr-1">({p.permisosIds.length})</span>
                    <button onClick={() => abrirEditarPlantilla(p)} title="Editar"
                      className="p-0.5 rounded text-neutral-300 hover:text-primary transition-colors">
                      <Pencil size={11} />
                    </button>
                    {confirmDelete === p.id ? (
                      <>
                        <button onClick={() => { onEliminarPlantilla(p.id); setConfirmDelete(null); }}
                          className="p-0.5 rounded text-danger font-bold text-xs hover:bg-danger-50">✓</button>
                        <button onClick={() => setConfirmDelete(null)}
                          className="p-0.5 rounded text-neutral-400 hover:bg-neutral-100"><X size={11} /></button>
                      </>
                    ) : (
                      <button onClick={() => setConfirmDelete(p.id)} title="Eliminar"
                        className="p-0.5 rounded text-neutral-300 hover:text-danger transition-colors">
                        <Trash2 size={11} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Permisos por categoría ── */}
          <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-1 border-t border-neutral-100 pt-4">
            {Object.entries(permisosPorCategoria).map(([categoria, permisos]) => (
              <div key={categoria}>
                <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">
                  {CATEGORIA_LABELS[categoria] ?? categoria}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {permisos.map(permiso => {
                    const pid = (permiso as any).permisoID ?? permiso.permisoId;
                    const activo = (permisosSeleccionados ?? []).includes(pid);
                    return (
                      <label key={(permiso as any).permisoID ?? permiso.permisoId}
                        className={`flex items-center gap-3 p-2.5 rounded-xl border-2 cursor-pointer
                                    transition-all select-none
                                    ${activo ? 'border-primary bg-primary/5' : 'border-neutral-200 hover:border-neutral-300'}`}>
                        <input type="checkbox" checked={activo} onChange={() => onToggle((permiso as any).permisoID ?? permiso.permisoId)} className="hidden" />
                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all
                                         ${activo ? 'border-primary bg-primary' : 'border-neutral-300'}`}>
                          {activo && (
                            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <p className={`text-xs font-medium truncate ${activo ? 'text-primary' : 'text-neutral-700'}`}>
                          {permiso.descripcion || permiso.nombre}
                        </p>
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
