// ════════════════════════════════════════════════════════════════════════════
// COMPONENT: Sidebar — Navegación lateral
// ════════════════════════════════════════════════════════════════════════════

import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  LayoutDashboard,
  ShoppingCart,
  Package,
  Tag,
  Receipt,
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
  adminOnly?: boolean;
  destacado?: boolean;   // ← POS resaltado
}

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

// ────────────────────────────────────────────────────────────────────────────
// ITEMS DE NAVEGACIÓN
// ────────────────────────────────────────────────────────────────────────────

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Inicio',
    path: ROUTES.INICIO,
    icon: <Home size={20} />,
  },
  {
    label: 'Dashboard',
    path: ROUTES.DASHBOARD,
    icon: <LayoutDashboard size={20} />,
    adminOnly: true,
  },
  {
    label: 'Vender',
    path: ROUTES.POS,
    icon: <ShoppingCart size={20} />,
    destacado: true,   // ← núcleo del sistema
  },
  {
    label: 'Turnos',
    path: ROUTES.TURNOS,
    icon: <Clock size={20} />,
  },
  {
    label: 'Ventas',
    path: ROUTES.VENTAS,
    icon: <Receipt size={20} />,
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
    label: 'Empleados',
    path: ROUTES.EMPLEADOS,
    icon: <Users size={20} />,
    adminOnly: true,
  },
  {
    label: 'Administración',
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

export const Sidebar = ({ collapsed, onToggle }: SidebarProps) => {
  const { isAdmin } = useAuth();

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
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: '#FFB000' }}
        >
          <ShoppingBag size={16} className="text-purple-900" />
        </div>
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
              {item.destacado ? (
                // ── POS — resaltado con background dorado ─────────────────
                <NavLink
                  to={item.path}
                  title={collapsed ? item.label : undefined}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-3 py-3 rounded-xl
                    transition-all duration-200 group
                    ${collapsed ? 'justify-center' : ''}
                    ${isActive
                      ? 'text-purple-900 shadow-lg'
                      : 'text-purple-900 hover:opacity-90 shadow-md'
                    }
                  `}
                  style={{ background: '#FFB000' }}
                >
                  <span className="shrink-0">{item.icon}</span>
                  {!collapsed && (
                    <span className="text-sm font-bold truncate">{item.label}</span>
                  )}
                  {/* Punto indicador cuando está activo y colapsado */}
                  {collapsed && (
                    <span className="absolute right-1 top-1 w-1.5 h-1.5 rounded-full bg-purple-900 opacity-0 group-[.active]:opacity-100"/>
                  )}
                </NavLink>
              ) : (
                // ── Item normal ───────────────────────────────────────────
                <NavLink
                  to={item.path}
                  title={collapsed ? item.label : undefined}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-3 py-2.5 rounded-lg
                    transition-all duration-200 group
                    ${collapsed ? 'justify-center' : ''}
                    ${isActive
                      ? 'bg-white/15 text-white'
                      : 'text-purple-300 hover:bg-white/8 hover:text-white'
                    }
                  `}
                >
                  <span className="shrink-0">{item.icon}</span>
                  {!collapsed && (
                    <span className="text-sm font-medium truncate">{item.label}</span>
                  )}
                </NavLink>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* ── BOTÓN COLAPSAR ────────────────────────────────────────────────── */}
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
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </aside>
  );
};