// ════════════════════════════════════════════════════════════════════════════
// ROUTES: Configuración de rutas con permisos
// ════════════════════════════════════════════════════════════════════════════

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PrivateRoute } from './PrivateRoute';
import { ROUTES } from '../utils/constants';

const LoginPage            = React.lazy(() => import('../pages/Login'));
const SeleccionEmpleadoPage= React.lazy(() => import('../pages/SeleccionEmpleado'));
const POSPage              = React.lazy(() => import('../pages/POS/index'));
const TurnosPage           = React.lazy(() => import('../pages/Turnos'));
const VentasPage           = React.lazy(() => import('../pages/Ventas'));
const CategoriasPage       = React.lazy(() => import('../pages/Categorias'));
const EmpleadosPage        = React.lazy(() => import('../pages/Empleados'));
const AuditoriaPage        = React.lazy(() => import('../pages/Admin/Auditoria'));
const ProductosPage        = React.lazy(() => import('../pages/Productos/index'));
const AdminPage            = React.lazy(() => import('../pages/Admin'));
const DashboardPage        = React.lazy(() => import('../pages/Dashboard'));
const InicioPage           = React.lazy(() => import('../pages/Inicio'));
const ConfiguracionPage    = React.lazy(() => import('../pages/Configuracion'));

export const AppRoutes = () => {
  return (
    <Routes>

      {/* ── PÚBLICAS ── */}
      <Route path="/"            element={<Navigate to={ROUTES.LOGIN} replace />} />
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />

      {/* ── SELECCIÓN DE EMPLEADO ── */}
      <Route path={ROUTES.SELECCION_EMPLEADO} element={<SeleccionEmpleadoPage />} />

      {/* ── PRIVADAS ── */}

      {/* Inicio — cualquier empleado */}
      <Route path={ROUTES.INICIO}
        element={<PrivateRoute><InicioPage /></PrivateRoute>}
      />

      {/* POS — requiere poder crear ventas */}
      <Route path={ROUTES.POS}
        element={
          <PrivateRoute requirePermission="ventas.crear">
            <POSPage />
          </PrivateRoute>
        }
      />

      {/* Productos — requiere ver productos */}
      <Route path={ROUTES.PRODUCTOS}
        element={
          <PrivateRoute requirePermission="productos.ver">
            <ProductosPage />
          </PrivateRoute>
        }
      />

      {/* Categorías — requiere ver categorías */}
      <Route path={ROUTES.CATEGORIAS}
        element={
          <PrivateRoute requirePermission="categorias.ver">
            <CategoriasPage />
          </PrivateRoute>
        }
      />

      {/* Ventas — requiere ver ventas (propias o todas) */}
      <Route path={ROUTES.VENTAS}
        element={
          <PrivateRoute requireAnyPermission={["ventas.ver_todas", "ventas.ver_propias"]}>
            <VentasPage />
          </PrivateRoute>
        }
      />

      {/* Turnos — requiere ver turno propio como mínimo */}
      <Route path={ROUTES.TURNOS}
        element={
          <PrivateRoute requireAnyPermission={["turnos.ver_todos", "turnos.ver_propio"]}>
            <TurnosPage />
          </PrivateRoute>
        }
      />

      {/* Solo admin */}
      <Route path={ROUTES.DASHBOARD}
        element={<PrivateRoute requireAdmin><DashboardPage /></PrivateRoute>}
      />
      <Route path={ROUTES.EMPLEADOS}
        element={<PrivateRoute requireAdmin><EmpleadosPage /></PrivateRoute>}
      />
      <Route path={ROUTES.ADMIN}
        element={<PrivateRoute requireAdmin><AdminPage /></PrivateRoute>}
      />
      <Route path={ROUTES.AUDITORIA}
        element={<PrivateRoute requireAdmin><AuditoriaPage /></PrivateRoute>}
      />
      <Route path={ROUTES.CONFIGURACION}
        element={<PrivateRoute requireAdmin><ConfiguracionPage /></PrivateRoute>}
      />

      {/* ── 404 ── */}
      <Route path="*"
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