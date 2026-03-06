// ════════════════════════════════════════════════════════════════════════════
// COMPONENT: ProductCard (Card de producto para el POS)
// ════════════════════════════════════════════════════════════════════════════

import React from 'react';
import { Package } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';
import { Badge } from '@/components/commons';
import type { ProductoSimple } from '@/types';

// ────────────────────────────────────────────────────────────────────────────
// TYPES
// ────────────────────────────────────────────────────────────────────────────

interface ProductCardProps {
  producto: ProductoSimple;
  onClick: (producto: ProductoSimple) => void;
}

// ────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ────────────────────────────────────────────────────────────────────────────

export const ProductCard: React.FC<ProductCardProps> = ({
  producto,
  onClick,
}) => {
  const isLowStock = producto.stock < 10;

  return (
    <button
      onClick={() => onClick(producto)}
      className="w-full bg-white rounded-lg p-4 shadow-md hover:shadow-xl
                 transform hover:scale-105 transition-all duration-200
                 text-left relative group"
    >
      {/* Badge de stock bajo */}
      {isLowStock && (
        <div className="absolute top-2 right-2">
          <Badge variant="warning" className="text-xs">
            Stock: {producto.stock}
          </Badge>
        </div>
      )}

      {/* Ícono */}
      <div className="w-12 h-12 bg-primary-50 rounded-full center mb-3
                      group-hover:bg-primary transition-colors">
        <Package
          size={24}
          className="text-primary group-hover:text-white transition-colors"
        />
      </div>

      {/* Nombre */}
      <h3 className="font-medium text-neutral-900 mb-2 text-sm leading-tight
                     line-clamp-2 min-h-[2.5rem]">
        {producto.nombre}
      </h3>

      {/* Precio */}
      <p className="text-xl font-bold text-primary">
        {formatCurrency(producto.precioVenta)}
      </p>

      {/* Categoría */}
      <p className="text-xs text-neutral-500 mt-1">
        {producto.categoria}
      </p>
    </button>
  );
};
