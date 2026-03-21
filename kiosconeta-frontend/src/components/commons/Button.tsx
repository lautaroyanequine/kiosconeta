// ════════════════════════════════════════════════════════════════════════════
// COMPONENT: Button
// ════════════════════════════════════════════════════════════════════════════

import React from 'react';
import { classNames } from '@/utils/helpers';

// ────────────────────────────────────────────────────────────────────────────
// TYPES
// ────────────────────────────────────────────────────────────────────────────

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
}

// ────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ────────────────────────────────────────────────────────────────────────────

export const Button= ({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  disabled,
  className,
  children,
  ...props
}:ButtonProps) => {
  // Clases base
  const baseClasses = 'btn inline-flex items-center justify-center';

  // Clases por variante
  const variantClasses = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    outline: 'btn-outline',
    ghost: 'btn-ghost',
    danger: 'btn-danger',
  };

  // Clases por tamaño
  const sizeClasses = {
    sm: 'btn-sm',
    md: '',
    lg: 'btn-lg',
  };

  // Clase de ancho completo
  const widthClass = fullWidth ? 'w-full' : '';

  // Combinar todas las clases
  const buttonClasses = classNames(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    widthClass,
    className
  );

  return (
    <button
      className={buttonClasses}
      disabled={disabled || loading}
      {...props}
    >
      {/* Loading spinner */}
      {loading && (
        <span className="spinner mr-2" />
      )}

      {/* Left icon */}
      {!loading && leftIcon && (
        <span className="mr-2">{leftIcon}</span>
      )}

      {/* Children */}
      {children}

      {/* Right icon */}
      {!loading && rightIcon && (
        <span className="ml-2">{rightIcon}</span>
      )}
    </button>
  );
};

// ────────────────────────────────────────────────────────────────────────────
// EJEMPLO DE USO
// ────────────────────────────────────────────────────────────────────────────

/*
import { Button } from '@/components/common/Button';
import { Plus, Save, Trash2 } from 'lucide-react';

// Botón primario
<Button variant="primary" onClick={handleSave}>
  Guardar
</Button>

// Botón con loading
<Button variant="primary" loading={isLoading}>
  Guardando...
</Button>

// Botón con ícono
<Button variant="primary" leftIcon={<Plus size={16} />}>
  Nuevo Producto
</Button>

// Botón full width
<Button variant="secondary" fullWidth>
  ¡COBRAR!
</Button>

// Botón pequeño
<Button variant="outline" size="sm">
  Cancelar
</Button>

// Botón peligroso
<Button variant="danger" leftIcon={<Trash2 size={16} />}>
  Eliminar
</Button>
*/
