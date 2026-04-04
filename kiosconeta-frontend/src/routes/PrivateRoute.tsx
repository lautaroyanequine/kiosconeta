import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useEmpleadoActivo } from '../contexts/EmpleadoActivoContext';
import { MainLayout } from '../components/layout/MainLayout';
import { ROUTES } from '../utils/constants';

interface PrivateRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requirePermission?: string;
}

export const PrivateRoute = ({
  children,
  requireAdmin = false,
  requirePermission,
}: PrivateRouteProps) => {
  const { isKioscoConfigured, isLoading } = useAuth();
  const { empleadoActivo } = useEmpleadoActivo();
  const location = useLocation();

  if (isLoading) return null;

  // Sin sesión de kiosco → login
  if (!isKioscoConfigured) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  // Sin empleado activo → selección
  if (!empleadoActivo) {
    return <Navigate to={ROUTES.SELECCION_EMPLEADO} replace />;
  }

  // Admin siempre puede acceder a todo
  if (empleadoActivo.esAdmin) {
    return <MainLayout>{children}</MainLayout>;
  }

  // Requiere ser admin y no lo es → POS
  if (requireAdmin) {
    return <Navigate to={ROUTES.POS} replace />;
  }

  // Requiere un permiso específico — el backend lo validará,
  // el frontend solo verifica que el empleado esté autenticado
  // Si querés bloquear en frontend también, podés cargar los permisos
  // del empleado activo y verificar acá

  return <MainLayout>{children}</MainLayout>;
};
