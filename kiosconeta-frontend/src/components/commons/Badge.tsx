// ════════════════════════════════════════════════════════════════════════════
// COMPONENT: Badge
// ════════════════════════════════════════════════════════════════════════════

import React from 'react';
import { classNames } from '@/utils/helpers';

type BadgeVariant = 'success' | 'danger' | 'warning' | 'info' | 'primary' | 'neutral';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  dot?: boolean;
  className?: string;
}

export const Badge= ({
  children,
  variant = 'neutral',
  dot = false,
  className,
}: BadgeProps) => {
  const variantClasses = {
    success: 'badge-success',
    danger: 'badge-danger',
    warning: 'badge-warning',
    info: 'badge-info',
    primary: 'badge-primary',
    neutral: 'badge bg-neutral-100 text-neutral-700 border border-neutral-300',
  };

  return (
    <span className={classNames('badge', variantClasses[variant], className)}>
      {dot && (
        <span className="inline-block w-2 h-2 rounded-full bg-current mr-1.5" />
      )}
      {children}
    </span>
  );
};

// ════════════════════════════════════════════════════════════════════════════
// COMPONENT: Spinner
// ════════════════════════════════════════════════════════════════════════════

type SpinnerSize = 'sm' | 'md' | 'lg';

interface SpinnerProps {
  size?: SpinnerSize;
  className?: string;
}

export const Spinner= ({ 
  size = 'md',
  className 
}:SpinnerProps) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div
      className={classNames(
        'spinner',
        sizeClasses[size],
        'border-primary',
        className
      )}
    />
  );
};

// ════════════════════════════════════════════════════════════════════════════
// COMPONENT: LoadingOverlay (Spinner centrado con overlay)
// ════════════════════════════════════════════════════════════════════════════

interface LoadingOverlayProps {
  message?: string;
}

export const LoadingOverlay = ({ 
  message = 'Cargando...' 
}:LoadingOverlayProps) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-8 shadow-xl text-center">
        <Spinner size="lg" />
        <p className="mt-4 text-neutral-600">{message}</p>
      </div>
    </div>
  );
};

// ────────────────────────────────────────────────────────────────────────────
// EJEMPLO DE USO
// ────────────────────────────────────────────────────────────────────────────

/*
import { Badge, Spinner, LoadingOverlay } from '@/components/common';

// Badge
<Badge variant="success">Activo</Badge>
<Badge variant="danger">Stock bajo</Badge>
<Badge variant="warning" dot>Advertencia</Badge>

// Spinner
<Spinner />
<Spinner size="lg" />

// Loading overlay
{isLoading && <LoadingOverlay message="Guardando..." />}
*/
