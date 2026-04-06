// ════════════════════════════════════════════════════════════════════════════
// COMPONENT: Sidebar — Navegación lateral
// ════════════════════════════════════════════════════════════════════════════

import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Tag,
  Receipt,
  Wallet,
  Clock,
  Users,
  Settings,
  ShoppingBag,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { ROUTES } from '@/utils/constants';
import { useAuth } from '@/contexts/AuthContext';

// ────────────────────────────────────────────────────────────────────────────
// TIPOS
// ────────────────────────────────────────────────────────────────────────────

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  adminOnly?: boolean;   // Solo visible para admins
}

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

// ────────────────────────────────────────────────────────────────────────────
// ITEMS DE NAVEGACIÓN
// Cada item tiene: etiqueta, ruta, ícono, y si es solo para admins
// ────────────────────────────────────────────────────────────────────────────

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Inicio',
    path: ROUTES.DASHBOARD,
    icon: <LayoutDashboard size={20} />,
    adminOnly: true,
  },
  {
    label: 'Vender',
    path: ROUTES.POS,
    icon: <ShoppingCart size={20} />,
  },
  {
    label: 'Productos',
    path: ROUTES.PRODUCTOS,
    icon: <Package size={20} />,
  },
  {
    label: 'Categorías',
    path: ROUTES.CATEGORIAS,
    icon: <Tag size={20} />,
  },
  {
    label: 'Ventas',
    path: ROUTES.VENTAS,
    icon: <Receipt size={20} />,
  },
  {
    label: 'Gastos',
    path: ROUTES.GASTOS,
    icon: <Wallet size={20} />,
  },
  {
    label: 'Turnos',
    path: ROUTES.TURNOS,
    icon: <Clock size={20} />,
  },
  {
    label: 'Empleados',
    path: ROUTES.EMPLEADOS,
    icon: <Users size={20} />,
  },
  {
    label: 'Administracion',
    path: ROUTES.ADMIN,
    icon: <ShieldCheck size={20} />,
    adminOnly: true,
  },
  {
    label: 'Configuración',
    path: ROUTES.CONFIGURACION,
    icon: <Settings size={20} />,
    adminOnly: true,
  },
];

// ────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ────────────────────────────────────────────────────────────────────────────

export const Sidebar = ({ collapsed, onToggle }:SidebarProps) => {
  const { isAdmin } = useAuth();

  // Filtrar items según si el usuario es admin o no
  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.adminOnly || isAdmin()
  );

  return (
    <aside
      className={`
        relative flex flex-col h-full
        transition-all duration-300 ease-in-out
        ${collapsed ? 'w-16' : 'w-56'}
      `}
      style={{ background: 'linear-gradient(180deg, #2e1065 0%, #1e0a4a 100%)' }}
    >
      {/* ── LOGO ──────────────────────────────────────────────────────────── */}
      <div className={`
        flex items-center h-16 px-4 border-b border-white/10 shrink-0
        ${collapsed ? 'justify-center' : 'gap-3'}
      `}>
        {/* Ícono siempre visible */}
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: '#FFB000' }}
        >
          <ShoppingBag size={16} className="text-purple-900" />
        </div>

        {/* Texto solo cuando está expandido */}
        {!collapsed && (
          <span className="text-white font-bold text-base tracking-tight">
            Kiosconeta
          </span>
        )}
      </div>

      {/* ── NAVEGACIÓN ────────────────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto py-4 scrollbar-hide">
        <ul className="space-y-1 px-2">
          {visibleItems.map((item) => (
            <li key={item.path}>
              {/*
                NavLink: es como un <a> pero sabe si la ruta está activa.
                Cuando la URL coincide con item.path, agrega la clase "active"
                automáticamente.
              */}
              <NavLink
                to={item.path}
                className={({ isActive }) => `
                  flex items-center gap-3 px-3 py-2.5 rounded-lg
                  transition-all duration-200 group
                  ${collapsed ? 'justify-center' : ''}
                  ${isActive
                    ? 'bg-white/15 text-white'
                    : 'text-purple-300 hover:bg-white/8 hover:text-white'
                  }
                `}
                title={collapsed ? item.label : undefined}
              >
                {/* Ícono */}
                <span className="shrink-0">{item.icon}</span>

                {/* Texto — solo cuando está expandido */}
                {!collapsed && (
                  <span className="text-sm font-medium truncate">
                    {item.label}
                  </span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* ── BOTÓN COLAPSAR ────────────────────────────────────────────────── */}
      {/*
        Este botón está posicionado en el borde derecho del sidebar.
        Al hacer click llama a onToggle() que viene del componente padre
        y cambia el estado collapsed.
      */}
      <button
        onClick={onToggle}
        className="
          absolute -right-3 top-20
          w-6 h-6 rounded-full
          flex items-center justify-center
          bg-purple-800 border border-purple-600
          text-purple-200 hover:text-white
          hover:bg-purple-700
          transition-all duration-200
          shadow-md z-10
        "
        title={collapsed ? 'Expandir menú' : 'Colapsar menú'}
      >
        {collapsed
          ? <ChevronRight size={12} />
          : <ChevronLeft size={12} />
        }
      </button>
    </aside>
  );
};