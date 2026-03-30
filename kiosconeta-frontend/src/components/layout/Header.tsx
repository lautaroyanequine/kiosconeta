// ════════════════════════════════════════════════════════════════════════════
// COMPONENT: Header — Barra superior
// ════════════════════════════════════════════════════════════════════════════

import React, { useState } from 'react';
import { LogOut, User, ChevronDown, Store, UserCheck, UserX, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useEmpleadoActivo } from '@/contexts/EmpleadoActivoContext';
import { EmpleadoSelectorModal } from './EmpleadoSelectorModal';

export const Header = () => {
  const { user, logout } = useAuth();
  const { empleadoActivo, abrirSelector, liberarEmpleado } = useEmpleadoActivo();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className="h-16 bg-white border-b border-neutral-200 flex items-center justify-between px-6 shrink-0">

        {/* Kiosco */}
        <div className="flex items-center gap-2 text-neutral-600">
          <Store size={18} className="text-primary" />
          <span className="text-sm font-medium">Kiosco #{user?.kioscoId}</span>
        </div>

        {/* Empleado activo */}
        <div className="flex items-center gap-2">
          {empleadoActivo ? (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-success-50 border border-success-200 rounded-xl">
              <UserCheck size={15} className="text-success shrink-0" />
              <span className="text-sm font-semibold text-success-700">{empleadoActivo.nombre}</span>
              <button onClick={abrirSelector} title="Cambiar empleado"
                className="ml-1 p-0.5 rounded text-success-500 hover:text-success-700 hover:bg-success-100 transition-all">
                <RefreshCw size={13} />
              </button>
              <button onClick={liberarEmpleado} title="Liberar puesto"
                className="p-0.5 rounded text-success-400 hover:text-danger hover:bg-danger-50 transition-all">
                <UserX size={13} />
              </button>
            </div>
          ) : (
            <button onClick={abrirSelector}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 border-dashed
                         border-neutral-300 text-neutral-500 hover:border-primary hover:text-primary
                         hover:bg-primary/5 transition-all text-sm font-medium">
              <User size={15} />
              Seleccionar empleado
            </button>
          )}
        </div>

        {/* Admin menu */}
        <div className="relative">
          <button onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-neutral-100 transition-colors">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                 style={{ background: 'linear-gradient(135deg, #6b24d7, #2e1065)' }}>
              {user?.nombre?.charAt(0).toUpperCase()}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-sm font-semibold text-neutral-800 leading-none mb-0.5">{user?.nombre}</p>
              <p className="text-xs text-neutral-500">Administrador</p>
            </div>
            <ChevronDown size={15} className={`text-neutral-400 transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-xl border border-neutral-200 z-20 py-2">
                <div className="px-4 py-3 border-b border-neutral-100">
                  <p className="text-sm font-semibold text-neutral-800">{user?.nombre}</p>
                  <p className="text-xs text-neutral-500 mt-0.5">{user?.email || 'Admin'}</p>
                </div>
                <button onClick={() => { setMenuOpen(false); logout(); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-danger hover:bg-danger-50 transition-colors">
                  <LogOut size={16} />
                  Cerrar sesión
                </button>
              </div>
            </>
          )}
        </div>
      </header>

      <EmpleadoSelectorModal />
    </>
  );
};
