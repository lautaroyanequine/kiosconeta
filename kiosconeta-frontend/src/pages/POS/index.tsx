// ════════════════════════════════════════════════════════════════════════════
// PAGE: POS — Punto de entrada
//
// Este archivo solo decide qué mostrar:
//   - Sin turno abierto → AbrirTurno (formulario de apertura)
//   - Con turno abierto → POSVenta (el punto de venta)
// ════════════════════════════════════════════════════════════════════════════

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { turnosApi } from '@/apis/turnosApi';
import { POSVenta } from './POSVenta';
import { AbrirTurno } from './AbrirTurno';
import type { TurnoActual } from '@/types/gastoTurno';

// ────────────────────────────────────────────────────────────────────────────
// COMPONENT
// ────────────────────────────────────────────────────────────────────────────

const POSPage: React.FC = () => {
  const { user } = useAuth();
  const [turnoActual, setTurnoActual] = useState<TurnoActual | null>(null);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    cargarTurno();
  }, []);

  // Carga el turno abierto — se llama al montar y después de abrir un turno
  const cargarTurno = async () => {
    setLoading(true);
    try {
      const data = await turnosApi.getActual(user!.kioscoId);
      setTurnoActual(data as any);
    } catch {
      setTurnoActual(null);
    } finally {
      setLoading(false);
    }
  };

  // Loading
  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-neutral-500">Cargando...</p>
        </div>
      </div>
    );
  }

  // Sin turno → formulario de apertura
  if (!turnoActual) {
    return <AbrirTurno onAbierto={cargarTurno} />;
  }

  // Con turno → POS completo
  return (
    <POSVenta
      turnoActual={turnoActual}
      onTurnoActualizado={cargarTurno}
    />
  );
};

export default POSPage;