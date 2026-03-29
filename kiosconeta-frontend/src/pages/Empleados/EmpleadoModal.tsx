// ════════════════════════════════════════════════════════════════════════════
// COMPONENT: EmpleadoModal — Crear / Editar empleado
// ════════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { Modal, Button, Input } from '@/components/commons';
import { useAuth } from '@/contexts/AuthContext';
import type { Empleado, CreateEmpleadoDTO, UpdateEmpleadoDTO } from '@/types';
import type { ModalMode } from './useEmpleados';

// ────────────────────────────────────────────────────────────────────────────
// TYPES
// ────────────────────────────────────────────────────────────────────────────

interface EmpleadoModalProps {
  mode: ModalMode;
  empleado: Empleado | null;
  isSaving: boolean;
  saveError: string | null;
  onClose: () => void;
  onGuardar: (data: CreateEmpleadoDTO | UpdateEmpleadoDTO) => void;
}

// ════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ════════════════════════════════════════════════════════════════════════════

export const EmpleadoModal: React.FC<EmpleadoModalProps> = ({
  mode,
  empleado,
  isSaving,
  saveError,
  onClose,
  onGuardar,
}) => {
  const { user } = useAuth();

  const [nombre, setNombre]     = useState('');
  const [legajo, setLegajo]     = useState('');
  const [telefono, setTelefono] = useState('');
  const [pin, setPin]           = useState('');
  const [touched, setTouched]   = useState(false);

  // Inicializar al abrir
  useEffect(() => {
    if (mode === 'editar' && empleado) {
      setNombre(empleado.nombre);
      setLegajo(empleado.legajo ?? '');
      setTelefono(empleado.telefono ?? '');
      setPin('');
    } else {
      setNombre('');
      setLegajo('');
      setTelefono('');
      setPin('');
    }
    setTouched(false);
  }, [mode, empleado]);

  const isValid = nombre.trim().length > 0 &&
    (mode === 'editar' || pin.length >= 4);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!isValid) return;

    if (mode === 'crear') {
      const dto: CreateEmpleadoDTO = {
        nombre:   nombre.trim(),
        legajo:   legajo.trim() || undefined,
        telefono: telefono.trim() || undefined,
        esAdmin:  false,
        pin:      pin,
        kioscoId: user!.kioscoId,
      };
      onGuardar(dto);
    } else if (empleado) {
      const dto: UpdateEmpleadoDTO = {
        empleadoId: empleado.empleadoId,
        nombre:     nombre.trim(),
        activo:     empleado.activo,   // mantener el activo actual, no pisarlo
      };
      onGuardar(dto);
    }
  };

  return (
    <Modal
      isOpen={mode !== null}
      onClose={onClose}
      title={mode === 'crear' ? 'Nuevo empleado' : 'Editar empleado'}
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
            {mode === 'crear' ? 'Crear empleado' : 'Guardar cambios'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">

        {saveError && (
          <div className="flex items-center gap-2 p-3 bg-danger-50 border border-danger-100
                          rounded-xl text-sm text-danger">
            <AlertCircle size={15} className="shrink-0" />
            {saveError}
          </div>
        )}

        <Input
          label="Nombre completo"
          value={nombre}
          onChange={e => setNombre(e.target.value)}
          onBlur={() => setTouched(true)}
          placeholder="Ej: Juan Pérez"
          error={touched && !nombre.trim() ? 'El nombre es obligatorio' : undefined}
          autoFocus
          required
        />

        <Input
          label="Legajo"
          value={legajo}
          onChange={e => setLegajo(e.target.value)}
          placeholder="Ej: EMP001 (opcional)"
        />

        <Input
          label="Teléfono"
          value={telefono}
          onChange={e => setTelefono(e.target.value)}
          placeholder="Ej: 11 2345-6789 (opcional)"
        />

        {/* PIN — solo al crear */}
        {mode === 'crear' && (
          <Input
            label="PIN de acceso"
            type="password"
            value={pin}
            onChange={e => setNuevoPin(e, setPin)}
            onBlur={() => setTouched(true)}
            placeholder="4 a 6 dígitos"
            maxLength={6}
            error={touched && pin.length < 4 ? 'El PIN debe tener al menos 4 dígitos' : undefined}
            required
          />
        )}

        {mode === 'crear' && (
          <p className="text-xs text-neutral-400 bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2">
            💡 El empleado se crea sin permisos. Podés asignarle una plantilla de rol desde la lista.
          </p>
        )}

        {mode === 'editar' && (
          <p className="text-xs text-neutral-400">
            Para cambiar el PIN del empleado usá el botón &quot;Asignar PIN&quot; en la lista.
          </p>
        )}
      </form>
    </Modal>
  );
};

// helper para filtrar solo dígitos en el PIN
const setNuevoPin = (
  e: React.ChangeEvent<HTMLInputElement>,
  setter: (v: string) => void
) => {
  const val = e.target.value.replace(/\D/g, '');
  setter(val);
};
