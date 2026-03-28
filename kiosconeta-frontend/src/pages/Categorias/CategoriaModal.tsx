// ════════════════════════════════════════════════════════════════════════════
// COMPONENT: CategoriaModal — Crear / Editar categoría
// ════════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { Modal, Button, Input } from '@/components/commons';
import type { Categoria } from '@/types';
import type { ModalMode } from './useCategorias';

// ────────────────────────────────────────────────────────────────────────────
// TYPES
// ────────────────────────────────────────────────────────────────────────────

interface CategoriaModalProps {
  mode: ModalMode;
  categoria: Categoria | null;
  isSaving: boolean;
  saveError: string | null;
  onClose: () => void;
  onGuardar: (nombre: string) => void;
}

// ════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ════════════════════════════════════════════════════════════════════════════

export const CategoriaModal: React.FC<CategoriaModalProps> = ({
  mode,
  categoria,
  isSaving,
  saveError,
  onClose,
  onGuardar,
}) => {
  const [nombre, setNombre] = useState('');
  const [touched, setTouched] = useState(false);

  // Inicializar valores al abrir
  useEffect(() => {
    if (mode === 'editar' && categoria) {
      setNombre(categoria.nombre);
    } else {
      setNombre('');
    }
    setTouched(false);
  }, [mode, categoria]);

  const isValid = nombre.trim().length > 0;
  const showError = touched && !isValid;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!isValid) return;
    onGuardar(nombre);
  };

  return (
    <Modal
      isOpen={mode !== null}
      onClose={onClose}
      title={mode === 'crear' ? 'Nueva categoría' : 'Editar categoría'}
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            loading={isSaving}
            disabled={!isValid}
          >
            {mode === 'crear' ? 'Crear categoría' : 'Guardar cambios'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Error del servidor */}
        {saveError && (
          <div className="flex items-center gap-2 p-3 bg-danger-50 border border-danger-100
                          rounded-xl text-sm text-danger">
            <AlertCircle size={15} className="shrink-0" />
            {saveError}
          </div>
        )}

        {/* Campo nombre */}
        <Input
          label="Nombre"
          value={nombre}
          onChange={e => setNombre(e.target.value)}
          onBlur={() => setTouched(true)}
          placeholder="Ej: Bebidas, Snacks, Lácteos..."
          error={showError ? 'El nombre es obligatorio' : undefined}
          autoFocus
          required
        />

        {/* Info referencia */}
        {mode === 'editar' && categoria?.cantidadProductos !== undefined && (
          <p className="text-xs text-neutral-400">
            Esta categoría tiene {categoria.cantidadProductos} producto
            {categoria.cantidadProductos !== 1 ? 's' : ''} asociado
            {categoria.cantidadProductos !== 1 ? 's' : ''}.
          </p>
        )}
      </form>
    </Modal>
  );
};
