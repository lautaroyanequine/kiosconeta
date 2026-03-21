// ════════════════════════════════════════════════════════════════════════════
// COMPONENT: MainLayout — Layout principal con Sidebar + Header
//
// CÓMO FUNCIONA:
// Este componente es el "envoltorio" de todas las páginas privadas.
// Cualquier página que esté dentro del sistema (después del login) usa este
// layout. El contenido de cada página entra por la prop "children".
//
// ESTRUCTURA VISUAL:
// ┌──────────┬────────────────────────────┐
// │          │  Header                    │
// │ Sidebar  ├────────────────────────────┤
// │          │  {children} (la página)    │
// │          │                            │
// └──────────┴────────────────────────────┘
//
// ESTADO:
// - collapsed: si el sidebar está colapsado (solo íconos) o expandido
// - Se guarda en localStorage para recordar la preferencia del usuario
// ════════════════════════════════════════════════════════════════════════════

import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { STORAGE_KEYS } from '@/utils/constants';
import { getStorage, setStorage } from '@/utils/helpers';

// ────────────────────────────────────────────────────────────────────────────
// TIPOS
// ────────────────────────────────────────────────────────────────────────────

interface MainLayoutProps {
  children: React.ReactNode;  // El contenido de cada página
}

// ────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ────────────────────────────────────────────────────────────────────────────

export const MainLayout= ({ children }: MainLayoutProps) => {
  /*
    useState: hook de React para manejar estado local.
    - El valor inicial lo leemos de localStorage (si el usuario ya lo configuró antes)
    - Si no hay valor guardado, empieza expandido (false = no colapsado)
  */
  const [collapsed, setCollapsed] = useState<boolean>(
    () => getStorage<boolean>(STORAGE_KEYS.SIDEBAR_COLLAPSED) ?? false
  );

  /*
    handleToggle: función que cambia el estado del sidebar.
    - Si está colapsado → lo expande
    - Si está expandido → lo colapsa
    - Guarda la preferencia en localStorage
  */
  const handleToggle = () => {
    const newValue = !collapsed;
    setCollapsed(newValue);
    setStorage(STORAGE_KEYS.SIDEBAR_COLLAPSED, newValue);
  };

  return (
    /*
      flex h-screen: ocupa toda la pantalla en horizontal
      overflow-hidden: evita scroll en el layout (cada sección scrollea por su cuenta)
    */
    <div className="flex h-screen overflow-hidden bg-neutral-50">

      {/* ── SIDEBAR ──────────────────────────────────────────────────────── */}
      {/*
        Le pasamos:
        - collapsed: para que sepa si mostrar solo íconos o también texto
        - onToggle: para que pueda cambiar su propio estado
      */}
      <Sidebar collapsed={collapsed} onToggle={handleToggle} />

      {/* ── CONTENIDO PRINCIPAL ──────────────────────────────────────────── */}
      {/*
        flex-1: ocupa todo el espacio restante (lo que no usa el sidebar)
        flex flex-col: apila Header y contenido verticalmente
        min-w-0: evita que el contenido desborde su contenedor
      */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Header siempre arriba */}
        <Header />

        {/* Contenido de la página — scrolleable */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>

      </div>
    </div>
  );
};