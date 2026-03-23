// ════════════════════════════════════════════════════════════════════════════
// ROUTES: Configuración de rutas de la app
// ════════════════════════════════════════════════════════════════════════════

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PrivateRoute } from './PrivateRoute';
import { ROUTES } from '../utils/constants';

// Páginas (lazy loading — se cargan solo cuando el usuario navega a ellas)
const LoginPage = React.lazy(() => import('../pages/Login'));
const POSPage   = React.lazy(() => import('../pages/POS/index'));
const TurnosPage = React.lazy(() => import('../pages/Turnos'))

// Dashboard temporal
const DashboardTempPage = () => (
  <div className="p-8">
    <h1 className="text-2xl font-bold text-neutral-800 mb-2">Panel de administración</h1>
    <p className="text-neutral-500">Dashboard en construcción — próximamente.</p>
  </div>
);

export const AppRoutes= () => {
  return (
    <Routes>

      {/* ── PÚBLICAS ── */}
      <Route path="/"             element={<Navigate to={ROUTES.LOGIN} replace />} />
      <Route path={ROUTES.LOGIN}  element={<LoginPage />} />

      {/* ── PRIVADAS ── */}
      <Route
        path={ROUTES.DASHBOARD}
        element={<PrivateRoute requireAdmin><DashboardTempPage /></PrivateRoute>}
      />


      <Route
        path={ROUTES.POS}
        element={<PrivateRoute><POSPage /></PrivateRoute>}
      />

      <Route
      path={ROUTES.TURNOS}
      element={<PrivateRoute><TurnosPage /></PrivateRoute> }/>

      {/* ── 404 ── */}
      <Route
        path="*"
        element={
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
              <p className="text-xl text-neutral-600 mb-6">Página no encontrada</p>
              <button onClick={() => window.history.back()}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:opacity-90">
                Volver atrás
              </button>
            </div>
          </div>
        }
      />
    </Routes>
  );
};