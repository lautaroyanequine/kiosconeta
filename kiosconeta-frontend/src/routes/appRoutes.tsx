// ════════════════════════════════════════════════════════════════════════════
// ROUTES: Configuración de rutas de la app
// ════════════════════════════════════════════════════════════════════════════

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PrivateRoute } from './PrivateRoute';
import { ROUTES } from '../utils/constants';

// Páginas (lazy loading — se cargan solo cuando el usuario navega a ellas)
const LoginPage           = React.lazy(() => import('../pages/Login'));
const SeleccionEmpleadoPage = React.lazy(() => import('../pages/SeleccionEmpleado'));
const POSPage   = React.lazy(() => import('../pages/POS/index'));
const TurnosPage = React.lazy(() => import('../pages/Turnos'));
const VentasPage  = React.lazy(() => import('../pages/Ventas'));
const CategoriasPage  = React.lazy(() => import('../pages/Categorias'));
const EmpleadosPage   = React.lazy(() => import('../pages/Empleados'));
const AuditoriaPage   = React.lazy(() => import('../pages/Auditoria'));
const GastosPage  = React.lazy(() => import('../pages/Gastos'))
const ProductosPage  = React.lazy(() => import('../pages/Productos/index'));



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

      {/* ── SELECCIÓN DE EMPLEADO (requiere kiosco configurado) ── */}
      <Route path={ROUTES.SELECCION_EMPLEADO} element={<SeleccionEmpleadoPage />} />

      {/* ── PRIVADAS ── */}
      <Route
        path={ROUTES.DASHBOARD}
        element={<PrivateRoute requireAdmin><DashboardTempPage /></PrivateRoute>}
      />

      <Route
        path={ROUTES.AUDITORIA}
        element={<PrivateRoute requireAdmin><AuditoriaPage /></PrivateRoute>}
      />


      <Route
        path={ROUTES.POS}
        element={<PrivateRoute><POSPage /></PrivateRoute>}
      />
      <Route
        path={ROUTES.PRODUCTOS}
        element={<PrivateRoute><ProductosPage /></PrivateRoute>}
      />

      <Route
      path={ROUTES.TURNOS}
      element={<PrivateRoute><TurnosPage /></PrivateRoute> }/>


      <Route
      path={ROUTES.VENTAS}
      element={<PrivateRoute><VentasPage /></PrivateRoute>}
      />

      <Route
        path={ROUTES.CATEGORIAS}
        element={<PrivateRoute><CategoriasPage /></PrivateRoute>}
      />

      <Route
        path={ROUTES.EMPLEADOS}
        element={<PrivateRoute><EmpleadosPage /></PrivateRoute>}
      />

      <Route
      path={ROUTES.GASTOS}
      element={<PrivateRoute><GastosPage /></PrivateRoute> }/>

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