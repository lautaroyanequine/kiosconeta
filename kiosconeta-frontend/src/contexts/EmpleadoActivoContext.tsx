// ════════════════════════════════════════════════════════════════════════════
// CONTEXT: EmpleadoActivo — con soporte de permisos
// ════════════════════════════════════════════════════════════════════════════

import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../apis';
import { setStorage, getStorage, removeStorage } from '../utils/helpers';
import { STORAGE_KEYS, ROUTES } from '../utils/constants';
import type { EmpleadoLoginDTO } from '../types/auth';

// ────────────────────────────────────────────────────────────────────────────
// TIPOS
// ────────────────────────────────────────────────────────────────────────────

export interface EmpleadoActivo {
  empleadoId: number;
  nombre: string;
  legajo: string | null;
  esAdmin: boolean;
  kioscoId: number;
  permisos: string[];   // ← nombres de permisos ej: ["ventas.crear", "productos.ver"]
}

interface EmpleadoActivoContextType {
  empleadoActivo: EmpleadoActivo | null;
  tokenEmpleado: string | null;
  isSelecting: boolean;
  isVerifyingPin: boolean;
  pinError: string;
  // Helpers de permisos
  tienePermiso: (permiso: string) => boolean;
  tieneAlgunPermiso: (permisos: string[]) => boolean;
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
  const [isSelecting,     setIsSelecting]    = useState(false);
  const [isVerifyingPin,  setIsVerifyingPin] = useState(false);
  const [pinError,        setPinError]       = useState('');

  // ── Helpers de permisos ───────────────────────────────────────────────────

  const tienePermiso = useCallback((permiso: string): boolean => {
    if (!empleadoActivo) return false;
    if (empleadoActivo.esAdmin) return true;    // admin bypassea todo
    return empleadoActivo.permisos.includes(permiso);
  }, [empleadoActivo]);

  const tieneAlgunPermiso = useCallback((permisos: string[]): boolean => {
    if (!empleadoActivo) return false;
    if (empleadoActivo.esAdmin) return true;
    return permisos.some(p => empleadoActivo.permisos.includes(p));
  }, [empleadoActivo]);

  // ── Abrir / cerrar selector ───────────────────────────────────────────────

  const abrirSelector  = useCallback(() => { setIsSelecting(true);  setPinError(''); }, []);
  const cerrarSelector = useCallback(() => { setIsSelecting(false); setPinError(''); }, []);

  // ── Confirmar PIN ─────────────────────────────────────────────────────────

  const confirmarPin = useCallback(async (
    pin: string,
    pendingEmpleado: EmpleadoLoginDTO
  ): Promise<boolean> => {
    setIsVerifyingPin(true);
    setPinError('');
    try {
      const response = await authApi.loginEmpleado({
        empleadoId: pendingEmpleado.empleadoId,
        pin,
      });

      const esAdminReal = response.esAdmin === true ||
        String(response.esAdmin).toLowerCase() === 'true';

      const activo: EmpleadoActivo = {
        empleadoId: response.empleadoId,
        nombre:     response.nombre,
        legajo:     pendingEmpleado.legajo,
        esAdmin:    esAdminReal,
        kioscoId:   response.kioscoId,
        permisos:   esAdminReal ? [] : (response.permisos ?? []),  // admin no necesita lista
      };

      setTokenEmpleado(response.token);
      setEmpleadoActivo(activo);
      setStorage(STORAGE_KEYS.TOKEN,           response.token);
      setStorage(STORAGE_KEYS.USER,            activo);
      setStorage(STORAGE_KEYS.EMPLEADO_ACTIVO, activo);
      setIsSelecting(false);

      navigate(esAdminReal ? ROUTES.DASHBOARD : ROUTES.POS);
      return true;
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? 'PIN incorrecto';
      setPinError(msg);
      return false;
    } finally {
      setIsVerifyingPin(false);
    }
  }, [navigate]);

  // ── Liberar empleado ──────────────────────────────────────────────────────

  const liberarEmpleado = useCallback(() => {
    setEmpleadoActivo(null);
    setTokenEmpleado(null);
    removeStorage(STORAGE_KEYS.EMPLEADO_ACTIVO);
    removeStorage(STORAGE_KEYS.TOKEN);
    removeStorage(STORAGE_KEYS.USER);
    navigate(ROUTES.SELECCION_EMPLEADO);
  }, [navigate]);

  return (
    <EmpleadoActivoContext.Provider value={{
      empleadoActivo,
      tokenEmpleado,
      isSelecting,
      isVerifyingPin,
      pinError,
      tienePermiso,
      tieneAlgunPermiso,
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