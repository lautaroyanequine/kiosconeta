import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { MainLayout } from '../components/layout/MainLayout';
import { ROUTES } from '../utils/constants';
import { Spinner } from '@/components/commons';

interface PrivateRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requirePermission?: string;
}

export const PrivateRoute= ({
  children,
  requireAdmin = false,
  requirePermission,
}:PrivateRouteProps) => {
  const { isAuthenticated, isLoading, isAdmin, hasPermission } = useAuth();
  const location = useLocation();

  // Mostrar loading mientras verifica autenticación
  if (isLoading) {
        <Spinner></Spinner>
    
  }

  // Si no está autenticado → redirigir a login
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  // Si requiere admin y no es admin → redirigir al POS
  if (requireAdmin && !isAdmin()) {
    return <Navigate to={ROUTES.POS} replace />;
  }

  // Si requiere permiso específico y no lo tiene → redirigir
  if (requirePermission && !hasPermission(requirePermission)) {
    return <Navigate to={isAdmin() ? ROUTES.DASHBOARD : ROUTES.POS} replace />;
  }

  // Todo OK → renderizar la página dentro del layout
  return <MainLayout>{children}</MainLayout>;
};