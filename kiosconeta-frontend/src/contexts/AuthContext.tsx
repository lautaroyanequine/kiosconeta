// ════════════════════════════════════════════════════════════════════════════
// CONTEXT: Authentication
// Maneja la sesión del KIOSCO (la PC configurada con email/password del admin).
// El token activo para las llamadas API lo maneja EmpleadoActivoContext.
// ════════════════════════════════════════════════════════════════════════════

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../apis';
import { setStorage, getStorage, removeStorage } from '../utils/helpers';
import { STORAGE_KEYS, ROUTES } from '../utils/constants';
import type { User, LoginAdminDTO, AuthResponse } from '../types';

// ────────────────────────────────────────────────────────────────────────────
// TYPES
// ────────────────────────────────────────────────────────────────────────────

interface AuthContextType {
  // La PC está configurada (tiene sesión de kiosco)
  kioscoUser: User | null;
  kioscoToken: string | null;
  isKioscoConfigured: boolean;
  isLoading: boolean;

  // Acciones
  loginKiosco: (credentials: LoginAdminDTO) => Promise<void>;
  logout: () => void;

  // Helpers (para compatibilidad con código existente)
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: () => boolean;
  hasPermission: (permission: string) => boolean;
  loginAdmin: (credentials: LoginAdminDTO) => Promise<void>;
  loginEmpleado: (credentials: any) => Promise<void>;
  checkAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ────────────────────────────────────────────────────────────────────────────
// PROVIDER
// ────────────────────────────────────────────────────────────────────────────

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [kioscoUser, setKioscoUser]   = useState<User | null>(null);
  const [kioscoToken, setKioscoToken] = useState<string | null>(null);
  const [isLoading, setIsLoading]     = useState(true);
  const navigate = useNavigate();

  // ── Inicializar desde localStorage ───────────────────────────────────────

  useEffect(() => {
    const storedToken = getStorage<string>(STORAGE_KEYS.KIOSCO_TOKEN);
    const storedUser  = getStorage<User>(STORAGE_KEYS.KIOSCO_USER);
    if (storedToken && storedUser) {
      setKioscoToken(storedToken);
      setKioscoUser(storedUser);
    }
    setIsLoading(false);
  }, []);

  // ── Login del kiosco (configura la PC con email/password del admin) ───────

  const loginKiosco = async (credentials: LoginAdminDTO): Promise<void> => {
    const response: AuthResponse = await authApi.loginAdmin(credentials);

    const userData: User = {
      empleadoId: response.empleadoId,
      nombre:     response.nombre,
      email:      response.email || undefined,
      esAdmin:    response.esAdmin,
      kioscoId:   response.kioscoId,
    };

    setKioscoToken(response.token);
    setKioscoUser(userData);

    // Guardar sesión del kiosco (persiste aunque cambie el empleado activo)
    setStorage(STORAGE_KEYS.KIOSCO_TOKEN, response.token);
    setStorage(STORAGE_KEYS.KIOSCO_USER, userData);
    setStorage(STORAGE_KEYS.KIOSCO_ID, response.kioscoId);

    // Ir a pantalla de selección de empleado
    navigate(ROUTES.SELECCION_EMPLEADO);
  };

  // ── Logout completo (borra sesión del kiosco) ─────────────────────────────

  const logout = (): void => {
    setKioscoUser(null);
    setKioscoToken(null);
    removeStorage(STORAGE_KEYS.KIOSCO_TOKEN);
    removeStorage(STORAGE_KEYS.KIOSCO_USER);
    removeStorage(STORAGE_KEYS.KIOSCO_ID);
    removeStorage(STORAGE_KEYS.TOKEN);
    removeStorage(STORAGE_KEYS.USER);
    removeStorage(STORAGE_KEYS.EMPLEADO_ACTIVO);
    navigate(ROUTES.LOGIN);
  };

  // ── Helpers de compatibilidad ─────────────────────────────────────────────

  const isAdmin = () => kioscoUser?.esAdmin || false;
  const hasPermission = (_p: string) => true; // el backend controla el acceso real
  const checkAuth = async () => !!(kioscoToken && kioscoUser);

  // loginAdmin = alias de loginKiosco para compatibilidad
  const loginAdmin = loginKiosco;

  // loginEmpleado ya no redirige — lo maneja EmpleadoActivoContext
  const loginEmpleado = async (_credentials: any) => {};

  const isKioscoConfigured = !!kioscoUser && !!kioscoToken;

  return (
    <AuthContext.Provider value={{
      kioscoUser,
      kioscoToken,
      isKioscoConfigured,
      isLoading,
      loginKiosco,
      logout,
      // compatibilidad
      user:            kioscoUser,
      token:           kioscoToken,
      isAuthenticated: isKioscoConfigured,
      isAdmin,
      hasPermission,
      loginAdmin,
      loginEmpleado,
      checkAuth,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// ────────────────────────────────────────────────────────────────────────────
// HOOK
// ────────────────────────────────────────────────────────────────────────────

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
};
