// ════════════════════════════════════════════════════════════════════════════
// COMPONENT: Table
// ════════════════════════════════════════════════════════════════════════════

import React from 'react';
import { classNames } from '@/utils/helpers';
import { Spinner } from './Badge';

// ────────────────────────────────────────────────────────────────────────────
// TYPES
// ────────────────────────────────────────────────────────────────────────────

interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
  width?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string | number;
  emptyMessage?: string;
  loading?: boolean;
  onRowClick?: (row: T) => void;
  className?: string;
}

// ────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ────────────────────────────────────────────────────────────────────────────

export const Table = <T extends Record<string, any>>({
  columns,
  data,
  keyExtractor,
  emptyMessage = 'No hay datos para mostrar',
  loading = false,
  onRowClick,
  className,
}: TableProps<T>) => {
  // Clases de alineación
  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  return (
    <div className="overflow-x-auto">
      <table className={classNames('table', className)}>
        {/* Header */}
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={alignClasses[column.align || 'left']}
                style={{ width: column.width }}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>

        {/* Body */}
        <tbody>
          {loading ? (
            <Spinner>
            </Spinner>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-center py-8">
                <span className="text-neutral-500">{emptyMessage}</span>
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr
                key={keyExtractor(row)}
                onClick={() => onRowClick?.(row)}
                className={onRowClick ? 'cursor-pointer' : ''}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={alignClasses[column.align || 'left']}
                  >
                    {column.render
                      ? column.render(row)
                      : row[column.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

// ────────────────────────────────────────────────────────────────────────────
// EJEMPLO DE USO
// ────────────────────────────────────────────────────────────────────────────

/*
import { Table } from '@/components/common/Table';
import { Badge } from '@/components/common/Badge';
import { formatCurrency } from '@/utils';

interface Producto {
  productoId: number;
  nombre: string;
  precio: number;
  stock: number;
  activo: boolean;
}

const columns: Column<Producto>[] = [
  {
    key: 'productoId',
    header: '#',
    width: '60px',
  },
  {
    key: 'nombre',
    header: 'Producto',
  },
  {
    key: 'precio',
    header: 'Precio',
    align: 'right',
    render: (row) => formatCurrency(row.precio),
  },
  {
    key: 'stock',
    header: 'Stock',
    align: 'center',
    render: (row) => (
      <span className={row.stock < 10 ? 'text-danger font-bold' : ''}>
        {row.stock}
      </span>
    ),
  },
  {
    key: 'activo',
    header: 'Estado',
    align: 'center',
    render: (row) => (
      <Badge variant={row.activo ? 'success' : 'danger'}>
        {row.activo ? 'Activo' : 'Inactivo'}
      </Badge>
    ),
  },
];

<Table
  columns={columns}
  data={productos}
  keyExtractor={(row) => row.productoId}
  onRowClick={(producto) => console.log('Click:', producto)}
  loading={isLoading}
  emptyMessage="No se encontraron productos"
/>
*/
