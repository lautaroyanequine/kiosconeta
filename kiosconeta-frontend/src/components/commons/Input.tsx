// ════════════════════════════════════════════════════════════════════════════
// COMPONENT: Input
// ════════════════════════════════════════════════════════════════════════════

import React, { forwardRef } from 'react';
import { classNames } from '@/utils/helpers';

// ────────────────────────────────────────────────────────────────────────────
// TYPES
// ────────────────────────────────────────────────────────────────────────────

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

// ────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ────────────────────────────────────────────────────────────────────────────

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      fullWidth = true,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    // Clases del contenedor
    const containerClasses = classNames(
      'input-group',
      fullWidth ? 'w-full' : ''
    );

    // Clases del input
    const inputClasses = classNames(
  'px-4 py-2 border rounded-md transition-colors duration-200',
  'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-20',
  leftIcon ? 'pl-10' : undefined,
  rightIcon ? 'pr-10' : undefined,
  error && 'border-danger focus:border-danger focus:ring-danger',
  !error && 'border-neutral-300 focus:border-primary',
  disabled && 'bg-neutral-100 cursor-not-allowed opacity-60',
  fullWidth ? 'w-full' : undefined,
  className
);

    return (
      <div className={containerClasses}>
        {/* Label */}
        {label && (
          <label className="input-label">
            {label}
            {props.required && <span className="text-danger ml-1">*</span>}
          </label>
        )}

        {/* Input container */}
        <div className="relative">
          {/* Left icon */}
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
              {leftIcon}
            </div>
          )}

          {/* Input */}
          <input
            ref={ref}
            className={inputClasses}
            disabled={disabled}
            {...props}
          />

          {/* Right icon */}
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400">
              {rightIcon}
            </div>
          )}
        </div>

        {/* Error message */}
        {error && (
          <span className="input-error">
            {error}
          </span>
        )}

        {/* Helper text */}
        {!error && helperText && (
          <span className="text-xs text-neutral-500 mt-1">
            {helperText}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

// ────────────────────────────────────────────────────────────────────────────
// EJEMPLO DE USO
// ────────────────────────────────────────────────────────────────────────────

/*
import { Input } from '@/components/common/Input';
import { Search, Mail, Lock } from 'lucide-react';

// Input básico
<Input
  label="Nombre"
  placeholder="Ingresa tu nombre"
  required
/>

// Input con error
<Input
  label="Email"
  type="email"
  error="Email inválido"
/>

// Input con íconos
<Input
  label="Buscar"
  placeholder="Buscar productos..."
  leftIcon={<Search size={18} />}
/>

// Input de password
<Input
  label="Contraseña"
  type="password"
  leftIcon={<Lock size={18} />}
  helperText="Mínimo 6 caracteres"
/>

// Input con ref (para useForm)
const emailRef = useRef<HTMLInputElement>(null);
<Input
  ref={emailRef}
  label="Email"
  type="email"
/>
*/
