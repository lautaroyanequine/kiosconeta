// ════════════════════════════════════════════════════════════════════════════
// CONTEXT: Authentication
// ════════════════════════════════════════════════════════════════════════════

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../apis';
import { setStorage, getStorage, removeStorage } from '../utils/helpers';
import { STORAGE_KEYS, ROUTES, MESSAGES } from '../utils/constants';
import type { User, LoginAdminDTO, LoginEmpleadoDTO, AuthResponse } from '../types';

// ────────────────────────────────────────────────────────────────────────────
// TYPES
// ────────────────────────────────────────────────────────────────────────────

interface AuthContextType {
  // Estado
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Acciones
  loginAdmin: (credentials: LoginAdminDTO) => Promise<void>;
  loginEmpleado: (credentials: LoginEmpleadoDTO) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<boolean>;
  
  // Helpers
  isAdmin: () => boolean;
  hasPermission: (permission: string) => boolean;
}

// ────────────────────────────────────────────────────────────────────────────
// CONTEXT
// ────────────────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ────────────────────────────────────────────────────────────────────────────
// PROVIDER
// ────────────────────────────────────────────────────────────────────────────

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // ──────────────────────────────────────────────────────────────────────────
  // INICIALIZAR (cargar desde localStorage)
  // ──────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    const initAuth = () => {
      const storedToken = getStorage<string>(STORAGE_KEYS.TOKEN);
      const storedUser = getStorage<User>(STORAGE_KEYS.USER);

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(storedUser);
      }

      setIsLoading(false);
    };

    initAuth();
  }, []);

  // ──────────────────────────────────────────────────────────────────────────
  // LOGIN ADMIN
  // ──────────────────────────────────────────────────────────────────────────

  const loginAdmin = async (credentials: LoginAdminDTO): Promise<void> => {
    try {
      const response: AuthResponse = await authApi.loginAdmin(credentials);
      handleAuthSuccess(response);
    } catch (error: any) {
      console.error('Login admin error:', error);
      throw error;
    }
  };

  // ──────────────────────────────────────────────────────────────────────────
  // LOGIN EMPLEADO
  // ──────────────────────────────────────────────────────────────────────────

  const loginEmpleado = async (credentials: LoginEmpleadoDTO): Promise<void> => {
    try {
      const response: AuthResponse = await authApi.loginEmpleado(credentials);
      handleAuthSuccess(response);
    } catch (error: any) {
      console.error('Login empleado error:', error);
      throw error;
    }
  };

  // ──────────────────────────────────────────────────────────────────────────
  // MANEJAR LOGIN EXITOSO
  // ──────────────────────────────────────────────────────────────────────────

  const handleAuthSuccess = (response: AuthResponse): void => {
    const userData: User = {
      empleadoId: response.empleadoId,
      nombre: response.nombre,
      email: response.email || undefined,
      esAdmin: response.esAdmin,
      kioscoId: response.kioscoId,
    };

    // Guardar en state
    setToken(response.token);
    setUser(userData);

    // Guardar en localStorage
    setStorage(STORAGE_KEYS.TOKEN, response.token);
    setStorage(STORAGE_KEYS.USER, userData);
    setStorage(STORAGE_KEYS.KIOSCO_ID, response.kioscoId);

    // Redirigir según el tipo de usuario
    if (response.esAdmin) {
      navigate(ROUTES.DASHBOARD);
    } else {
      navigate(ROUTES.POS);
    }
  };

  // ──────────────────────────────────────────────────────────────────────────
  // LOGOUT
  // ──────────────────────────────────────────────────────────────────────────

  const logout = (): void => {
    // Limpiar state
    setUser(null);
    setToken(null);

    // Limpiar localStorage
    removeStorage(STORAGE_KEYS.TOKEN);
    removeStorage(STORAGE_KEYS.USER);
    removeStorage(STORAGE_KEYS.KIOSCO_ID);

    // Redirigir a login
    navigate(ROUTES.LOGIN);
  };

  // ──────────────────────────────────────────────────────────────────────────
  // VERIFICAR AUTENTICACIÓN
  // ──────────────────────────────────────────────────────────────────────────

  const checkAuth = async (): Promise<boolean> => {
    const storedToken = getStorage<string>(STORAGE_KEYS.TOKEN);

    if (!storedToken) {
      return false;
    }

    try {
      // Verificar token con el backend
      const response = await authApi.verificarToken();
      return response.valido;
    } catch (error) {
      console.error('Token verification failed:', error);
      logout();
      return false;
    }
  };

  // ──────────────────────────────────────────────────────────────────────────
  // HELPERS
  // ──────────────────────────────────────────────────────────────────────────

  const isAdmin = (): boolean => {
    return user?.esAdmin || false;
  };

  const hasPermission = (permission: string): boolean => {
    // Si es admin, tiene todos los permisos
    if (user?.esAdmin) {
      return true;
    }

    // TODO: Implementar verificación de permisos específicos
    // Esto requerirá cargar los permisos del usuario desde el backend
    // y almacenarlos en el contexto o en localStorage

    return false;
  };

  // ──────────────────────────────────────────────────────────────────────────
  // COMPUTED VALUES
  // ──────────────────────────────────────────────────────────────────────────

  const isAuthenticated = !!user && !!token;

  // ──────────────────────────────────────────────────────────────────────────
  // CONTEXT VALUE
  // ──────────────────────────────────────────────────────────────────────────

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated,
    isLoading,
    loginAdmin,
    loginEmpleado,
    logout,
    checkAuth,
    isAdmin,
    hasPermission,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// ────────────────────────────────────────────────────────────────────────────
// HOOK
// ────────────────────────────────────────────────────────────────────────────

/**
 * Hook para usar el contexto de autenticación
 * @returns AuthContext
 * @throws Error si se usa fuera del AuthProvider
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }

  return context;
};