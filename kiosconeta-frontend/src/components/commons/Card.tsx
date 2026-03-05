// ════════════════════════════════════════════════════════════════════════════
// COMPONENT: Card
// ════════════════════════════════════════════════════════════════════════════

import React from 'react';
import { classNames } from '@/utils/helpers';

// ────────────────────────────────────────────────────────────────────────────
// TYPES
// ────────────────────────────────────────────────────────────────────────────

interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  headerAction?: React.ReactNode;
  footer?: React.ReactNode;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  borderColor?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning';
  className?: string;
  onClick?: () => void;
}

// ────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ────────────────────────────────────────────────────────────────────────────

export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  headerAction,
  footer,
  hover = false,
  padding = 'md',
  borderColor,
  className,
  onClick,
}) => {
  // Clases de padding
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  // Clases de borde superior
  const borderClasses = {
    primary: 'border-t-4 border-primary',
    secondary: 'border-t-4 border-secondary',
    success: 'border-t-4 border-success',
    danger: 'border-t-4 border-danger',
    warning: 'border-t-4 border-warning',
  };

  // Clases base
  const cardClasses = classNames(
    'card',
    hover && 'card-hover',
    paddingClasses[padding],
    borderColor && borderClasses[borderColor],
    onClick && 'cursor-pointer',
    className
  );

  return (
    <div className={cardClasses} onClick={onClick}>
      {/* Header */}
      {(title || subtitle || headerAction) && (
        <div className="mb-4">
          <div className="flex items-start justify-between">
            <div>
              {title && (
                <h3 className="text-lg font-semibold text-neutral-900">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-sm text-neutral-500 mt-1">
                  {subtitle}
                </p>
              )}
            </div>
            {headerAction && <div>{headerAction}</div>}
          </div>
        </div>
      )}

      {/* Content */}
      <div>{children}</div>

      {/* Footer */}
      {footer && (
        <div className="mt-4 pt-4 border-t border-neutral-200">
          {footer}
        </div>
      )}
    </div>
  );
};

// ────────────────────────────────────────────────────────────────────────────
// EJEMPLO DE USO
// ────────────────────────────────────────────────────────────────────────────

/*
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { MoreVertical } from 'lucide-react';

// Card básica
<Card>
  <p>Contenido de la card</p>
</Card>

// Card con título
<Card title="Ventas del día">
  <p className="text-3xl font-bold text-primary">$45.000</p>
</Card>

// Card con borde de color
<Card 
  title="Stock bajo"
  borderColor="danger"
>
  <p>5 productos con stock crítico</p>
</Card>

// Card con header action
<Card
  title="Productos"
  subtitle="156 productos activos"
  headerAction={
    <Button variant="ghost" size="sm">
      <MoreVertical size={16} />
    </Button>
  }
>
  <p>Lista de productos...</p>
</Card>

// Card con footer
<Card
  title="Turno actual"
  footer={
    <div className="flex gap-2">
      <Button variant="outline" size="sm">Ver detalle</Button>
      <Button variant="danger" size="sm">Cerrar turno</Button>
    </div>
  }
>
  <p>Turno abierto desde las 08:00</p>
</Card>

// Card clickeable con hover
<Card hover onClick={() => console.log('Click!')}>
  <h4>Producto clickeable</h4>
  <p>$650</p>
</Card>
*/
