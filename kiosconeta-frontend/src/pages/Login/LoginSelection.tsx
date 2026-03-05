// ════════════════════════════════════════════════════════════════════════════
// PAGE: Login Selection (Selección Admin vs Empleado)
// ════════════════════════════════════════════════════════════════════════════

import React from 'react';
import { UserCircle2, Users } from 'lucide-react';

// ────────────────────────────────────────────────────────────────────────────
// TYPES
// ────────────────────────────────────────────────────────────────────────────

interface LoginSelectionProps {
  onSelectAdmin: () => void;
  onSelectEmpleado: () => void;
}

// ────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ────────────────────────────────────────────────────────────────────────────

export const LoginSelection: React.FC<LoginSelectionProps> = ({
  onSelectAdmin,
  onSelectEmpleado,
}) => {
  return (
    <div className="min-h-screen bg-gradient-primary center">
      <div className="w-full max-w-md px-6">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-white rounded-full center mx-auto mb-4 shadow-lg">
            <span className="text-4xl font-bold text-primary">K</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">KIOSCONETA</h1>
          <p className="text-white text-opacity-90">
            Sistema de Gestión de Kiosco
          </p>
        </div>

        {/* Selección */}
        <div className="space-y-4">
          {/* Administrador */}
          <button
            onClick={onSelectAdmin}
            className="w-full bg-white rounded-xl p-6 shadow-lg hover:shadow-xl 
                       transform hover:scale-105 transition-all duration-200
                       group"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-primary-50 rounded-full center 
                              group-hover:bg-primary group-hover:text-white
                              transition-colors">
                <UserCircle2 size={32} className="text-primary group-hover:text-white" />
              </div>
              <div className="text-left flex-1">
                <h3 className="text-lg font-semibold text-neutral-900 mb-1">
                  Administrador
                </h3>
                <p className="text-sm text-neutral-500">
                  Acceso completo al sistema
                </p>
              </div>
              <div className="text-primary group-hover:text-secondary transition-colors">
                →
              </div>
            </div>
          </button>

          {/* Empleado */}
          <button
            onClick={onSelectEmpleado}
            className="w-full bg-white rounded-xl p-6 shadow-lg hover:shadow-xl 
                       transform hover:scale-105 transition-all duration-200
                       group"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-secondary-50 rounded-full center 
                              group-hover:bg-secondary group-hover:text-primary
                              transition-colors">
                <Users size={32} className="text-secondary group-hover:text-primary" />
              </div>
              <div className="text-left flex-1">
                <h3 className="text-lg font-semibold text-neutral-900 mb-1">
                  Empleado
                </h3>
                <p className="text-sm text-neutral-500">
                  Acceso al punto de venta
                </p>
              </div>
              <div className="text-secondary group-hover:text-primary transition-colors">
                →
              </div>
            </div>
          </button>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-white text-opacity-75 text-sm">
            Hecho con ❤️ para tu negocio
          </p>
        </div>
      </div>
    </div>
  );
};
