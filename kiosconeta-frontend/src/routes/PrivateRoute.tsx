// ════════════════════════════════════════════════════════════════════════════
// COMPONENT: PrivateRoute (Proteger rutas autenticadas)
// ════════════════════════════════════════════════════════════════════════════

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ROUTES } from '../utils/constants';

// ────────────────────────────────────────────────────────────────────────────
// TYPES
// ────────────────────────────────────────────────────────────────────────────

interface PrivateRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;        // Si true, solo admins pueden acceder
  requirePermission?: string;    // Permiso requerido (ej: "productos.crear")
}

// ────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ────────────────────────────────────────────────────────────────────────────

export const PrivateRoute: React.FC<PrivateRouteProps> = ({
  children,
  requireAdmin = false,
  requirePermission,
}) => {
  const { isAuthenticated, isLoading, user, isAdmin, hasPermission } = useAuth();
  const location = useLocation();

  // Mostrar loading mientras verifica autenticación
  if (isLoading) {
    return (
      <div className="min-h-screen center">
        <div className="text-center">
          <div className="spinner w-12 h-12 border-4 border-primary mb-4"></div>
          <p className="text-neutral-600">Cargando...</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado, redirigir a login
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  // Si requiere admin y no es admin, redirigir al POS
  if (requireAdmin && !isAdmin()) {
    return <Navigate to={ROUTES.POS} replace />;
  }

  // Si requiere permiso específico y no lo tiene, redirigir
  if (requirePermission && !hasPermission(requirePermission)) {
    return (
      <Navigate
        to={isAdmin() ? ROUTES.DASHBOARD : ROUTES.POS}
        replace
      />
    );
  }

  // Todo OK, renderizar el componente
  return <>{children}</>;
};
