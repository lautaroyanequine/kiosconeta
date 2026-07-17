// ════════════════════════════════════════════════════════════════════════════
// COMPONENT: TagsTab — ABM simple de Tags (para promociones y filtros)
// ════════════════════════════════════════════════════════════════════════════

import React, { useState } from 'react';
import { Tag as TagIcon, Plus, Trash2, AlertTriangle, X } from 'lucide-react';
import { Button, Modal } from '@/components/commons';
import { useAuth } from '@/contexts/AuthContext';
import { tagsApi } from '@/apis/promocionesApi';
import type { Tag as TagType } from '@/types';

interface TagsTabProps {
  tags: TagType[];
  onCreated: (tag: TagType) => void;
  onDeleted: (tagId: number) => void;
}

export const TagsTab: React.FC<TagsTabProps> = ({ tags, onCreated, onDeleted }) => {
  const { user } = useAuth();
  const [nombre, setNombre] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [tagAEliminar, setTagAEliminar] = useState<TagType | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleCrear = async () => {
    if (!user?.kioscoId) return;
    if (!nombre.trim()) { setError('Ingresá un nombre'); return; }

    setIsSaving(true);
    setError('');
    try {
      const nuevo = await tagsApi.create(user.kioscoId, { nombre: nombre.trim() });
      onCreated(nuevo);
      setNombre('');
    } catch (err: any) {
      setError(err.message || 'Error al crear el tag');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEliminar = async () => {
    if (!tagAEliminar) return;
    setIsDeleting(true);
    try {
      await tagsApi.delete(tagAEliminar.tagId);
      onDeleted(tagAEliminar.tagId);
      setTagAEliminar(null);
    } catch (err: any) {
      setError(err.message || 'Error al eliminar el tag');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-neutral-900 flex items-center gap-2">
          <TagIcon size={18} className="text-primary" /> Tags
        </h2>
        <p className="text-sm text-neutral-500 mt-0.5">
          Usalos para agrupar productos por marca u otro criterio (ej: "Mondelez", "Sin TACC") y aplicar promociones sobre ellos.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <AlertTriangle size={15} /> {error}
          <button onClick={() => setError('')} className="ml-auto"><X size={14} /></button>
        </div>
      )}

      {/* Crear */}
      <div className="flex gap-2 bg-white rounded-xl border border-neutral-200 p-4">
        <input
          type="text"
          value={nombre}
          onChange={e => setNombre(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleCrear()}
          placeholder="Nombre del tag, ej: Mondelez"
          className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:border-primary"
        />
        <Button variant="primary" leftIcon={<Plus size={15} />} onClick={handleCrear} loading={isSaving}>
          Crear
        </Button>
      </div>

      {/* Listado */}
      {tags.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center text-neutral-400">
          <TagIcon size={32} className="mb-2 opacity-30" />
          <p className="text-sm">Todavía no creaste ningún tag</p>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {tags.map(t => (
            <div
              key={t.tagId}
              className="flex items-center gap-2 pl-3 pr-2 py-1.5 bg-white border border-neutral-200 rounded-full text-sm text-neutral-700"
            >
              {t.nombre}
              <button
                onClick={() => setTagAEliminar(t)}
                className="text-neutral-300 hover:text-red-500 transition-colors"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Confirmar eliminar */}
      <Modal
        isOpen={!!tagAEliminar}
        onClose={() => setTagAEliminar(null)}
        title="Eliminar tag"
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setTagAEliminar(null)} disabled={isDeleting}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleEliminar} loading={isDeleting}>
              Sí, eliminar
            </Button>
          </>
        }
      >
        <p className="text-neutral-700">
          ¿Eliminás el tag <strong>{tagAEliminar?.nombre}</strong>?
        </p>
        <p className="text-sm text-neutral-500 mt-2">
          Se va a quitar de todos los productos que lo tengan asignado.
        </p>
      </Modal>
    </div>
  );
};