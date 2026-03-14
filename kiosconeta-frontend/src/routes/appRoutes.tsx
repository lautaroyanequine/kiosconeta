// ════════════════════════════════════════════════════════════════════════════
// ROUTES: Configuración de React Router
// ════════════════════════════════════════════════════════════════════════════

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PrivateRoute } from './PrivateRoute';
import { ROUTES } from '../utils/constants';

// ────────────────────────────────────────────────────────────────────────────
// LAZY LOADING DE PÁGINAS
// ────────────────────────────────────────────────────────────────────────────

// Auth
const LoginPage = React.lazy(() => import('../pages/Login'));

// Main
const POSPage = React.lazy(() => import('../pages/POS/index'));

// Dashboard temporal hasta tener la página real
const DashboardTempPage = () => (
  <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-3xl font-bold text-primary mb-2">Panel Admin</h1>
      <p className="text-neutral-500 mb-6">Dashboard en construcción</p>
      <a href="/pos" className="bg-primary text-white px-6 py-2 rounded-lg">
        Ir al POS
      </a>
    </div>
  </div>
);

/*
// Main
const DashboardPage = React.lazy(() => import('../pages/dashboard'));

// Gestión
const ProductosPage = React.lazy(() => import('../pages/productos'));
const VentasPage = React.lazy(() => import('../pages/ventas'));
const GastosPage = React.lazy(() => import('../pages/gastos'));
const TurnosPage = React.lazy(() => import('../pages/turnos'));
const EmpleadosPage = React.lazy(() => import('../pages/empleados'));
const ConfiguracionPage = React.lazy(() => import('../pages/configuracion'));
*/

// ────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ────────────────────────────────────────────────────────────────────────────

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* ──────────────────────────────────────────────────────────────────── */}
      {/* RUTAS PÚBLICAS */}
      {/* ──────────────────────────────────────────────────────────────────── */}
      
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />
      
      {/* Redirect root a login */}
      <Route path="/" element={<Navigate to={ROUTES.LOGIN} replace />} />

      {/* ──────────────────────────────────────────────────────────────────── */}
      {/* RUTAS PRIVADAS */}
      {/* ──────────────────────────────────────────────────────────────────── */}

      {/* Dashboard - Solo Admin */}
      <Route
        path={ROUTES.DASHBOARD}
        element={
          <PrivateRoute requireAdmin>
            <DashboardTempPage />
          </PrivateRoute>
        }
      />

      
      POS - Todos los autenticados
      <Route
        path={ROUTES.POS}
        element={
          <PrivateRoute>
            <POSPage />
          </PrivateRoute>
        }
      />

      
{/*
      Dashboard - Solo Admin
      <Route
        path={ROUTES.DASHBOARD}
        element={
          <PrivateRoute requireAdmin>
            <DashboardPage />
          </PrivateRoute>
        }
      />

      POS - Todos los autenticados
      <Route
        path={ROUTES.POS}
        element={
          <PrivateRoute>
            <POSPage />
          </PrivateRoute>
        }
      />

      Productos - Requiere permiso
      <Route
        path={ROUTES.PRODUCTOS}
        element={
          <PrivateRoute requirePermission="productos.ver">
            <ProductosPage />
          </PrivateRoute>
        }
      />

      Ventas - Requiere permiso
      <Route
        path={ROUTES.VENTAS}
        element={
          <PrivateRoute requirePermission="ventas.ver_todas">
            <VentasPage />
          </PrivateRoute>
        }
      />

      Gastos - Requiere permiso
      <Route
        path={ROUTES.GASTOS}
        element={
          <PrivateRoute requirePermission="gastos.ver_todos">
            <GastosPage />
          </PrivateRoute>
        }
      />

      Turnos - Requiere permiso
      <Route
        path={ROUTES.TURNOS}
        element={
          <PrivateRoute requirePermission="turnos.ver_todos">
            <TurnosPage />
          </PrivateRoute>
        }
      />

      Empleados - Solo Admin
      <Route
        path={ROUTES.EMPLEADOS}
        element={
          <PrivateRoute requireAdmin>
            <EmpleadosPage />
          </PrivateRoute>
        }
      />

      Configuración - Solo Admin
      <Route
        path={ROUTES.CONFIGURACION}
        element={
          <PrivateRoute requireAdmin>
            <ConfiguracionPage />
          </PrivateRoute>
        }
      />
}

      {/* ──────────────────────────────────────────────────────────────────── */}
      {/* 404 - NOT FOUND */}
      {/* ──────────────────────────────────────────────────────────────────── */}

      <Route
        path="*"
        element={
          <div className="min-h-screen center">
            <div className="text-center">
              <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
              <p className="text-xl text-neutral-600 mb-6">Página no encontrada</p>
              <button
                onClick={() => window.history.back()}
                className="btn-primary"
              >
                Volver atrás
              </button>
            </div>
          </div>
        }
      />
    </Routes>
  );
};
