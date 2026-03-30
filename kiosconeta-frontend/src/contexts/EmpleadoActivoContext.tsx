// ════════════════════════════════════════════════════════════════════════════
// CONTEXT: EmpleadoActivo
// Maneja qué empleado está usando el sistema en este momento.
// Separado del AuthContext (que solo maneja la sesión del kiosco/admin).
// ════════════════════════════════════════════════════════════════════════════

import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { authApi } from '../apis';
import { setStorage, getStorage, removeStorage } from '../utils/helpers';
import { STORAGE_KEYS } from '../utils/constants';
import type { EmpleadoLoginDTO } from '../types';

// ────────────────────────────────────────────────────────────────────────────
// TYPES
// ────────────────────────────────────────────────────────────────────────────

export interface EmpleadoActivo {
  empleadoId: number;
  nombre: string;
  legajo: string | null;
  esAdmin: boolean;
}

interface EmpleadoActivoContextType {
  empleadoActivo: EmpleadoActivo | null;
  isSelecting: boolean;           // muestra el modal de selección
  isVerifyingPin: boolean;        // está verificando el PIN
  pinError: string;

  // Acciones
  abrirSelector: () => void;
  cerrarSelector: () => void;
  seleccionarEmpleado: (empleado: EmpleadoLoginDTO) => void;  // paso 1: elegir
  confirmarPin: (pin: string) => Promise<boolean>;             // paso 2: PIN
  liberarEmpleado: () => void;                                 // liberar al cerrar turno
  tienePermiso: (permiso: string) => boolean;
}

// ────────────────────────────────────────────────────────────────────────────
// CONTEXT
// ────────────────────────────────────────────────────────────────────────────

const EmpleadoActivoContext = createContext<EmpleadoActivoContextType | undefined>(undefined);

// ────────────────────────────────────────────────────────────────────────────
// PROVIDER
// ────────────────────────────────────────────────────────────────────────────

export const EmpleadoActivoProvider = ({ children }: { children: ReactNode }) => {
  const [empleadoActivo, setEmpleadoActivo] = useState<EmpleadoActivo | null>(() => {
    return getStorage<EmpleadoActivo>(STORAGE_KEYS.EMPLEADO_ACTIVO) ?? null;
  });

  const [isSelecting, setIsSelecting]         = useState(false);
  const [isVerifyingPin, setIsVerifyingPin]   = useState(false);
  const [pinError, setPinError]               = useState('');

  // empleado pendiente de confirmar PIN
  const [pendingEmpleado, setPendingEmpleado] = useState<EmpleadoLoginDTO | null>(null);

  // ── Abrir / cerrar selector ───────────────────────────────────────────────

  const abrirSelector = useCallback(() => {
    setPinError('');
    setPendingEmpleado(null);
    setIsSelecting(true);
  }, []);

  const cerrarSelector = useCallback(() => {
    setIsSelecting(false);
    setPendingEmpleado(null);
    setPinError('');
  }, []);

  // ── Paso 1: elegir empleado (sin PIN todavía) ─────────────────────────────

  const seleccionarEmpleado = useCallback((empleado: EmpleadoLoginDTO) => {
    setPendingEmpleado(empleado);
    setPinError('');
  }, []);

  // ── Paso 2: verificar PIN ─────────────────────────────────────────────────

  const confirmarPin = useCallback(async (pin: string): Promise<boolean> => {
    if (!pendingEmpleado) return false;
    setIsVerifyingPin(true);
    setPinError('');
    try {
      // Reutilizamos el loginEmpleado del backend solo para verificar el PIN.
      // No guardamos el token que devuelve — solo nos importa que no tire error.
      await authApi.loginEmpleado({
        empleadoId: pendingEmpleado.empleadoId,
        pin,
      });

      const activo: EmpleadoActivo = {
        empleadoId: pendingEmpleado.empleadoId,
        nombre:     pendingEmpleado.nombre,
        legajo:     pendingEmpleado.legajo,
        esAdmin:    pendingEmpleado.esAdmin,
      };

      setEmpleadoActivo(activo);
      setStorage(STORAGE_KEYS.EMPLEADO_ACTIVO, activo);
      setIsSelecting(false);
      setPendingEmpleado(null);
      return true;
    } catch {
      setPinError('PIN incorrecto. Intentá de nuevo.');
      return false;
    } finally {
      setIsVerifyingPin(false);
    }
  }, [pendingEmpleado]);

  // ── Liberar empleado (al cerrar turno o manualmente) ─────────────────────

  const liberarEmpleado = useCallback(() => {
    setEmpleadoActivo(null);
    removeStorage(STORAGE_KEYS.EMPLEADO_ACTIVO);
  }, []);

  // ── Verificar permiso ─────────────────────────────────────────────────────
  // Por ahora es permissivo — el backend es quien rechaza con 403.
  // Cuando tengamos los permisos del empleado cargados se puede refinar.

  const tienePermiso = useCallback((_permiso: string): boolean => {
    if (!empleadoActivo) return false;
    if (empleadoActivo.esAdmin) return true;
    return true; // el backend controla el acceso real
  }, [empleadoActivo]);

  // ────────────────────────────────────────────────────────────────────────

  return (
    <EmpleadoActivoContext.Provider value={{
      empleadoActivo,
      isSelecting,
      isVerifyingPin,
      pinError,
      pendingEmpleado,
      abrirSelector,
      cerrarSelector,
      seleccionarEmpleado,
      confirmarPin,
      liberarEmpleado,
      tienePermiso,
    } as any}>
      {children}
    </EmpleadoActivoContext.Provider>
  );
};

// ────────────────────────────────────────────────────────────────────────────
// HOOK
// ────────────────────────────────────────────────────────────────────────────

export const useEmpleadoActivo = (): EmpleadoActivoContextType & { pendingEmpleado: EmpleadoLoginDTO | null } => {
  const ctx = useContext(EmpleadoActivoContext);
  if (!ctx) throw new Error('useEmpleadoActivo debe usarse dentro de EmpleadoActivoProvider');
  return ctx as any;
};
