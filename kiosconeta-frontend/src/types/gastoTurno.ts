// ════════════════════════════════════════════════════════════════════════════
// TYPES: Gastos y Turnos
// ════════════════════════════════════════════════════════════════════════════

// ────────────────────────────────────────────────────────────────────────────
// GASTO
// ────────────────────────────────────────────────────────────────────────────

export interface Gasto {
  gastoId: number;
  descripcion: string;
  monto: number;
  fecha: string;              // ISO date string
  tipoGastoId: number;
  tipoGasto?: {
    nombre: string;
  };
  empleadoId: number;
  empleado?: {
    nombre: string;
  };
  turnoId?: number;
  kioscoId: number;
}

export interface CreateGastoDTO {
  descripcion: string;
  monto: number;
  tipoGastoId: number;
  empleadoId: number;
  kioscoId: number;
}

// ────────────────────────────────────────────────────────────────────────────
// TIPO DE GASTO
// ────────────────────────────────────────────────────────────────────────────

export interface TipoGasto {
  tipoGastoId: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  kioscoId: number;
}

// ────────────────────────────────────────────────────────────────────────────
// TURNO
// ────────────────────────────────────────────────────────────────────────────

export interface Turno {
  turnoId: number;
  fechaApertura: string;      // ISO date string
  fechaCierre?: string;       // ISO date string
  efectivoInicial: number;
  efectivoFinal?: number;
  totalVentas?: number;
  totalGastos?: number;
  diferencia?: number;
  observaciones?: string;
  kioscoId: number;
  empleados?: EmpleadoTurno[];
}

export interface EmpleadoTurno {
  empleadoId: number;
  nombre: string;
  ventasRealizadas: number;
  totalVendido: number;
}

// ────────────────────────────────────────────────────────────────────────────
// ABRIR/CERRAR TURNO
// ────────────────────────────────────────────────────────────────────────────

export interface AbrirTurnoDTO {
  efectivoInicial: number;
  kioscoId: number;
}

export interface CerrarTurnoDTO {
  turnoId: number;
  efectivoFinal: number;
  observaciones?: string;
}

// ────────────────────────────────────────────────────────────────────────────
// CIERRE DE TURNO (Detalle completo)
// ────────────────────────────────────────────────────────────────────────────

export interface CierreTurno {
  turno: Turno;
  resumenVentas: {
    totalVentas: number;
    cantidadVentas: number;
    promedioVenta: number;
  };
  resumenGastos: {
    totalGastos: number;
    cantidadGastos: number;
  };
  resumenEfectivo: {
    efectivoInicial: number;
    efectivoEsperado: number;
    efectivoReal: number;
    diferencia: number;
  };
  resumenMetodosPago: {
    metodoPago: string;
    cantidad: number;
    total: number;
  }[];
  ventasPorEmpleado: EmpleadoTurno[];
}