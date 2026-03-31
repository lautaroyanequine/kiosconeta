// ════════════════════════════════════════════════════════════════════════════
// PRIVATE ROUTE
// Verifica dos niveles:
// 1. PC configurada (sesión de kiosco)
// 2. Empleado activo seleccionado
// ════════════════════════════════════════════════════════════════════════════

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
}: PrivateRouteProps) => {
  const { isKioscoConfigured, isLoading } = useAuth();
  const { empleadoActivo } = useEmpleadoActivo();
  const location = useLocation();

  if (isLoading) return null;

  // Sin sesión de kiosco → login
  if (!isKioscoConfigured) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  // Sesión de kiosco OK pero sin empleado activo → selección de empleado
  if (!empleadoActivo) {
    return <Navigate to={ROUTES.SELECCION_EMPLEADO} replace />;
  }

  // Requiere admin y el empleado activo no es admin → POS
  if (requireAdmin && !empleadoActivo.esAdmin) {
    return <Navigate to={ROUTES.POS} replace />;
  }

  return <MainLayout>{children}</MainLayout>;
};
