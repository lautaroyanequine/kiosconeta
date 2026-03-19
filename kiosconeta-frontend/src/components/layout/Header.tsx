// ════════════════════════════════════════════════════════════════════════════
// COMPONENT: Header — Barra superior
// ════════════════════════════════════════════════════════════════════════════

import React, { useState } from 'react';
import { LogOut, User, ChevronDown, Store } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

// ────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ────────────────────────────────────────────────────────────────────────────

export const Header: React.FC = () => {
  const { user, logout, isAdmin } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="
      h-16 bg-white border-b border-neutral-200
      flex items-center justify-between
      px-6 shrink-0
    ">

      {/* ── LADO IZQUIERDO: Info del kiosco ─────────────────────────────── */}
      <div className="flex items-center gap-2 text-neutral-600">
        <Store size={18} className="text-primary" />
        <span className="text-sm font-medium">
          Kiosco #{user?.kioscoId}
        </span>
      </div>

      {/* ── LADO DERECHO: Usuario ───────────────────────────────────────── */}
      <div className="relative">
        {/*
          Botón que muestra el nombre del usuario.
          Al hacer click abre/cierra el menú desplegable.
        */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="
            flex items-center gap-2.5
            px-3 py-2 rounded-lg
            hover:bg-neutral-100
            transition-colors duration-200
          "
        >
          {/* Avatar con inicial del nombre */}
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
            style={{ background: 'linear-gradient(135deg, #6b24d7, #2e1065)' }}
          >
            {user?.nombre?.charAt(0).toUpperCase()}
          </div>

          {/* Info del usuario */}
          <div className="text-left hidden sm:block">
            <p className="text-sm font-semibold text-neutral-800 leading-none mb-0.5">
              {user?.nombre}
            </p>
            <p className="text-xs text-neutral-500">
              {isAdmin() ? 'Administrador' : 'Empleado'}
            </p>
          </div>

          <ChevronDown
            size={15}
            className={`text-neutral-400 transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {/* ── MENÚ DESPLEGABLE ──────────────────────────────────────────── */}
        {/*
          Este menú aparece cuando menuOpen es true.
          Está posicionado de forma absoluta debajo del botón.
        */}
        {menuOpen && (
          <>
            {/* Overlay invisible para cerrar al hacer click afuera */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setMenuOpen(false)}
            />

            {/* Menú */}
            <div className="
              absolute right-0 top-full mt-2 w-52
              bg-white rounded-xl shadow-xl border border-neutral-200
              z-20 py-2 animate-fade-in
            ">
              {/* Info del usuario */}
              <div className="px-4 py-3 border-b border-neutral-100">
                <p className="text-sm font-semibold text-neutral-800">{user?.nombre}</p>
                <p className="text-xs text-neutral-500 mt-0.5">{user?.email || 'Empleado'}</p>
              </div>

              {/* Perfil */}
              <button className="
                w-full flex items-center gap-3
                px-4 py-2.5 text-sm text-neutral-700
                hover:bg-neutral-50 transition-colors
              ">
                <User size={16} className="text-neutral-400" />
                Mi perfil
              </button>

              {/* Cerrar sesión */}
              <button
                onClick={() => {
                  setMenuOpen(false);
                  logout();
                }}
                className="
                  w-full flex items-center gap-3
                  px-4 py-2.5 text-sm text-danger
                  hover:bg-danger-50 transition-colors
                "
              >
                <LogOut size={16} />
                Cerrar sesión
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
};