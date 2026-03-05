// ════════════════════════════════════════════════════════════════════════════
// COMPONENT: Modal
// ════════════════════════════════════════════════════════════════════════════

import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { classNames } from '@/utils/helpers';

// ────────────────────────────────────────────────────────────────────────────
// TYPES
// ────────────────────────────────────────────────────────────────────────────

type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: ModalSize;
  closeOnOverlayClick?: boolean;
  showCloseButton?: boolean;
}

// ────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ────────────────────────────────────────────────────────────────────────────

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  closeOnOverlayClick = true,
  showCloseButton = true,
}) => {
  // Cerrar con ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  // Prevenir scroll del body cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Si no está abierto, no renderizar nada
  if (!isOpen) return null;

  // Clases por tamaño
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4',
  };

  // Manejar click en overlay
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center modal-overlay"
      onClick={handleOverlayClick}
    >
      {/* Modal content */}
      <div
        className={classNames(
          'modal-content',
          sizeClasses[size],
          'max-h-[90vh] overflow-y-auto'
        )}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between mb-4">
            {title && (
              <h2 className="text-xl font-semibold text-neutral-900">
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="text-neutral-400 hover:text-neutral-600 transition-colors"
                aria-label="Cerrar"
              >
                <X size={24} />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="mb-4">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-neutral-200">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

// ────────────────────────────────────────────────────────────────────────────
// EJEMPLO DE USO
// ────────────────────────────────────────────────────────────────────────────

/*
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { useState } from 'react';

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        Abrir Modal
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Confirmar acción"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Eliminar
            </Button>
          </>
        }
      >
        <p>¿Estás seguro de que querés eliminar este producto?</p>
        <p className="text-sm text-neutral-500 mt-2">
          Esta acción no se puede deshacer.
        </p>
      </Modal>
    </>
  );
}

// Modal grande con formulario
<Modal
  isOpen={isOpen}
  onClose={handleClose}
  title="Nuevo Producto"
  size="lg"
  footer={
    <>
      <Button variant="outline" onClick={handleClose}>
        Cancelar
      </Button>
      <Button variant="primary" onClick={handleSave}>
        Guardar
      </Button>
    </>
  }
>
  <form>
    <Input label="Nombre" />
    <Input label="Precio" type="number" />
    {/* más campos */
 /* </form>
</Modal>
*/
