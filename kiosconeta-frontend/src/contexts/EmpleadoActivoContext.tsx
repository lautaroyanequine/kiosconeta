// ════════════════════════════════════════════════════════════════════════════
// CONTEXT: EmpleadoActivo
// Maneja qué empleado está usando el sistema ahora.
// Su token JWT es el que se usa en todas las llamadas a la API.
// ════════════════════════════════════════════════════════════════════════════

import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../apis';
import { setStorage, getStorage, removeStorage } from '../utils/helpers';
import { STORAGE_KEYS, ROUTES } from '../utils/constants';
import type { EmpleadoLoginDTO } from '../types';

// ────────────────────────────────────────────────────────────────────────────
// TYPES
// ────────────────────────────────────────────────────────────────────────────

export interface EmpleadoActivo {
  empleadoId: number;
  nombre: string;
  legajo: string | null;
  esAdmin: boolean;
  kioscoId: number;
}

interface EmpleadoActivoContextType {
  empleadoActivo: EmpleadoActivo | null;
  tokenEmpleado: string | null;
  isSelecting: boolean;
  isVerifyingPin: boolean;
  pinError: string;
  abrirSelector: () => void;
  cerrarSelector: () => void;
  confirmarPin: (pin: string, empleado: EmpleadoLoginDTO) => Promise<boolean>;
  liberarEmpleado: () => void;
}

const EmpleadoActivoContext = createContext<EmpleadoActivoContextType | undefined>(undefined);

// ────────────────────────────────────────────────────────────────────────────
// PROVIDER
// ────────────────────────────────────────────────────────────────────────────

export const EmpleadoActivoProvider = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();

  const [empleadoActivo, setEmpleadoActivo] = useState<EmpleadoActivo | null>(() =>
    getStorage<EmpleadoActivo>(STORAGE_KEYS.EMPLEADO_ACTIVO) ?? null
  );
  const [tokenEmpleado, setTokenEmpleado] = useState<string | null>(() =>
    getStorage<string>(STORAGE_KEYS.TOKEN) ?? null
  );

  const [isSelecting, setIsSelecting]         = useState(false);
  const [isVerifyingPin, setIsVerifyingPin]   = useState(false);
  const [pinError, setPinError]               = useState('');
  // ── Abrir / cerrar selector ───────────────────────────────────────────────

  const abrirSelector = useCallback(() => {
    setPinError('');
    setPendingEmpleado(null);
    setIsSelecting(true);
  }, []);

  const cerrarSelector = useCallback(() => {
    setIsSelecting(false);
    setPinError('');
  }, []);



  // ── Confirmar PIN → obtener token del empleado ────────────────────────────

  const confirmarPin = useCallback(async (pin: string, pendingEmpleado: EmpleadoLoginDTO): Promise<boolean> => {
    if (!pendingEmpleado) return false;
    setIsVerifyingPin(true);
    setPinError('');
    try {
      const response = await authApi.loginEmpleado({
        empleadoId: pendingEmpleado.empleadoId,
        pin,
      });

      const activo: EmpleadoActivo = {
        empleadoId: response.empleadoId,
        nombre:     response.nombre,
        legajo:     pendingEmpleado.legajo,
        esAdmin:    response.esAdmin,
        kioscoId:   response.kioscoId,
      };

      // Guardar token del empleado — Axios lo usará en todas las llamadas
      setTokenEmpleado(response.token);
      setEmpleadoActivo(activo);
      setStorage(STORAGE_KEYS.TOKEN, response.token);
      setStorage(STORAGE_KEYS.USER, activo);
      setStorage(STORAGE_KEYS.EMPLEADO_ACTIVO, activo);

      setIsSelecting(false);
      setPendingEmpleado(null);

      // Redirigir al POS (o dashboard si es admin)
      navigate(response.esAdmin ? ROUTES.DASHBOARD : ROUTES.POS);
      return true;
    } catch (err: any) {
      setPinError(err.message || 'PIN incorrecto. Intentá de nuevo.');
      return false;
    } finally {
      setIsVerifyingPin(false);
    }
  }, [navigate]);

  // ── Liberar empleado (al cerrar turno) ────────────────────────────────────

  const liberarEmpleado = useCallback(() => {
    setEmpleadoActivo(null);
    setTokenEmpleado(null);
    removeStorage(STORAGE_KEYS.EMPLEADO_ACTIVO);
    removeStorage(STORAGE_KEYS.TOKEN);
    removeStorage(STORAGE_KEYS.USER);
    // Volver a pantalla de selección
    navigate(ROUTES.SELECCION_EMPLEADO);
  }, [navigate]);

  return (
    <EmpleadoActivoContext.Provider value={{
      empleadoActivo,
      tokenEmpleado,
      isSelecting,
      isVerifyingPin,
      pinError,
      pendingEmpleado: null,
      abrirSelector,
      cerrarSelector,
      confirmarPin,
      liberarEmpleado,
    }}>
      {children}
    </EmpleadoActivoContext.Provider>
  );
};

// ────────────────────────────────────────────────────────────────────────────
// HOOK
// ────────────────────────────────────────────────────────────────────────────

export const useEmpleadoActivo = () => {
  const ctx = useContext(EmpleadoActivoContext);
  if (!ctx) throw new Error('useEmpleadoActivo debe usarse dentro de EmpleadoActivoProvider');
  return ctx;
};
