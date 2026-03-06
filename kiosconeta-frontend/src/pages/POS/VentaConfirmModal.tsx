// ════════════════════════════════════════════════════════════════════════════
// COMPONENT: VentaConfirmModal (Modal de venta confirmada)
// ════════════════════════════════════════════════════════════════════════════

import React, { useEffect } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Button, Modal } from '@/components/commons';
import { formatCurrency } from '@/utils/formatters';

// ────────────────────────────────────────────────────────────────────────────
// TYPES
// ────────────────────────────────────────────────────────────────────────────

interface VentaConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  ventaId: number;
  total: number;
  metodoPago: string;
}

// ────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ────────────────────────────────────────────────────────────────────────────

export const VentaConfirmModal: React.FC<VentaConfirmModalProps> = ({
  isOpen,
  onClose,
  ventaId,
  total,
  metodoPago,
}) => {
  // Auto-cerrar después de 3 segundos
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      showCloseButton={false}
      closeOnOverlayClick={false}
    >
      <div className="text-center py-6">
        {/* Ícono de éxito */}
        <div className="w-20 h-20 bg-success-50 rounded-full center mx-auto mb-6
                        animate-scale-in">
          <CheckCircle2 size={48} className="text-success" />
        </div>

        {/* Título */}
        <h2 className="text-2xl font-bold text-neutral-900 mb-2">
          ¡Venta Confirmada!
        </h2>

        {/* Detalles */}
        <div className="space-y-2 mb-6">
          <p className="text-neutral-600">
            Venta <span className="font-semibold">#{ventaId}</span>
          </p>
          <p className="text-3xl font-bold text-primary">
            {formatCurrency(total)}
          </p>
          <p className="text-neutral-600">
            Método: <span className="font-semibold">{metodoPago}</span>
          </p>
        </div>

        {/* Botones */}
        <div className="flex flex-col gap-2">
          <Button
            variant="secondary"
            fullWidth
            onClick={onClose}
          >
            Nueva Venta
          </Button>

          <Button
            variant="outline"
            fullWidth
            onClick={() => {
              // TODO: Implementar impresión de ticket
              alert('Función de impresión en desarrollo');
            }}
          >
            Ver Ticket
          </Button>
        </div>

        {/* Contador */}
        <p className="text-xs text-neutral-500 mt-4">
          Se cerrará automáticamente en 3 segundos
        </p>
      </div>
    </Modal>
  );
};
