// ════════════════════════════════════════════════════════════════════════════
// COMPONENT: ErrorBoundary — evita la pantalla en blanco ante un crash de React
// ════════════════════════════════════════════════════════════════════════════
//
// Sin esto, cualquier error durante el render (por ejemplo el clásico
// "Failed to execute 'removeChild' on 'Node'" que dispara la traducción
// automática del navegador al pisarle los nodos del DOM a React) deja la
// página completamente en blanco, sin ningún aviso para el usuario.

import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  huboError: boolean;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { huboError: false };
  }

  static getDerivedStateFromError(): State {
    return { huboError: true };
  }

  componentDidCatch(error: unknown, info: React.ErrorInfo) {
    // Queda en la consola para poder diagnosticar (ej: distinguir el caso de
    // traducción automática de un bug real de la app).
    console.error('ErrorBoundary atrapó un error:', error, info.componentStack);
  }

  render() {
    if (this.state.huboError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-6">
          <div className="text-center max-w-sm">
            <p className="text-lg font-semibold text-neutral-800 mb-2">
              Algo salió mal
            </p>
            <p className="text-sm text-neutral-500 mb-5">
              Si tu navegador está traduciendo automáticamente esta página,
              desactivá la traducción y volvé a intentar.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Recargar página
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}