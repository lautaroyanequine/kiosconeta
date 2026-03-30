// ════════════════════════════════════════════════════════════════════════════
// APP: Componente principal
// ════════════════════════════════════════════════════════════════════════════

import React, { Suspense } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { EmpleadoActivoProvider } from './contexts/EmpleadoActivoContext';
import { AppRoutes } from './routes/appRoutes';

// ────────────────────────────────────────────────────────────────────────────
// LOADING FALLBACK
// ────────────────────────────────────────────────────────────────────────────

const LoadingFallback= () => (
  <div className="min-h-screen center bg-neutral-50">
    <div className="text-center">
      <div className="spinner w-16 h-16 border-4 border-primary mb-4"></div>
      <p className="text-lg text-neutral-600">Cargando...</p>
    </div>
  </div>
);

// ────────────────────────────────────────────────────────────────────────────
// APP COMPONENT
// ────────────────────────────────────────────────────────────────────────────

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <EmpleadoActivoProvider>
          <Suspense fallback={<LoadingFallback />}>
            <AppRoutes />
          </Suspense>
        </EmpleadoActivoProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
