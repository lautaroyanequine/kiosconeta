import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useEmpleadoActivo } from '../contexts/EmpleadoActivoContext';
import { MainLayout } from '../components/layout/MainLayout';
import { ROUTES } from '../utils/constants';

interface PrivateRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requirePermission?: string;    // un permiso exacto
  requireAnyPermission?: string[]; // al menos uno de estos
}

export const PrivateRoute = ({
  children,
  requireAdmin = false,
  requirePermission,
  requireAnyPermission,
}: PrivateRouteProps) => {
  const { isKioscoConfigured, isLoading } = useAuth();
  const { empleadoActivo, tienePermiso, tieneAlgunPermiso } = useEmpleadoActivo();
  const location = useLocation();

  if (isLoading) return null;

  // Sin sesión de kiosco → login
  if (!isKioscoConfigured)
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;

  // Sin empleado activo → selección
  if (!empleadoActivo)
    return <Navigate to={ROUTES.SELECCION_EMPLEADO} replace />;

  // Admin siempre puede acceder a todo
  if (empleadoActivo.esAdmin)
    return <MainLayout>{children}</MainLayout>;

  // Requiere ser admin y no lo es → POS
  if (requireAdmin)
    return <Navigate to={ROUTES.POS} replace />;

  // Verificar permiso específico
  if (requirePermission && !tienePermiso(requirePermission))
    return <Navigate to={ROUTES.POS} replace />;

  // Verificar al menos uno de varios permisos
  if (requireAnyPermission && !tieneAlgunPermiso(requireAnyPermission))
    return <Navigate to={ROUTES.POS} replace />;

  return <MainLayout>{children}</MainLayout>;
};