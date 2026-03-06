// ════════════════════════════════════════════════════════════════════════════
// COMPONENT: CartItem (Item del carrito)
// ════════════════════════════════════════════════════════════════════════════

import React from 'react';
import { Plus, Minus, Trash2 } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';
import type { ItemCarrito } from '@/types';

// ────────────────────────────────────────────────────────────────────────────
// TYPES
// ────────────────────────────────────────────────────────────────────────────

interface CartItemProps {
  item: ItemCarrito;
  onIncrement: () => void;
  onDecrement: () => void;
  onRemove: () => void;
}

// ────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ────────────────────────────────────────────────────────────────────────────

export const CartItem: React.FC<CartItemProps> = ({
  item,
  onIncrement,
  onDecrement,
  onRemove,
}) => {
  return (
    <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg
                    hover:bg-neutral-100 transition-colors">
      {/* Info del producto */}
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-neutral-900 mb-1 truncate">
          {item.nombre}
        </h4>
        <p className="text-sm text-neutral-500">
          {formatCurrency(item.precioUnitario)} × {item.cantidad}
        </p>
      </div>

      {/* Controles de cantidad */}
      <div className="flex items-center gap-3 mx-4">
        <button
          onClick={onDecrement}
          className="w-8 h-8 rounded-full border-2 border-neutral-300 center
                     hover:border-primary hover:bg-primary hover:text-white
                     transition-all active:scale-95"
        >
          <Minus size={16} />
        </button>

        <span className="font-bold text-lg w-8 text-center">
          {item.cantidad}
        </span>

        <button
          onClick={onIncrement}
          disabled={item.cantidad >= item.stock}
          className="w-8 h-8 rounded-full border-2 border-neutral-300 center
                     hover:border-primary hover:bg-primary hover:text-white
                     transition-all active:scale-95
                     disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Subtotal y eliminar */}
      <div className="flex items-center gap-4">
        <p className="font-bold text-lg text-neutral-900 min-w-[5rem] text-right">
          {formatCurrency(item.subtotal)}
        </p>

        <button
          onClick={onRemove}
          className="text-danger hover:text-danger-600 transition-colors
                     active:scale-95"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
};
