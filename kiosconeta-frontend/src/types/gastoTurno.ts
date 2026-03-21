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
  turnoID: number;
  nombre: string;
}

export interface CierreTurno {
  cierreTurnoId: number;
  fechaApertura: string;      // ISO date string
  fechaCierre?: string;       // ISO date string
  efectivoInicial: number;
  totalEfectivo: number
  totalVirtual: number;
  efectivoEsperado: number
  totalVentas?: number;
  totalGastos?: number;
  cantidadVentas: number
  diferencia?: number;
  observaciones?: string;
  kioscoId: number;
  empleados?: EmpleadoTurno[];
}

// Turno en tiempo real — mientras está abierto
export interface TurnoActual {
  cierreTurnoId: number;
  fechaApertura: string;
  fechaAperturaFormateada: string;
  efectivoInicial: number;
  efectivoEsperado: number;    // ← efectivo inicial + ventas efectivo - gastos
  cantidadVentas: number;
  totalVentas: number;
  totalEfectivo: number;
  totalVirtual: number;
  totalGastos: number;
  empleados: string[];         // ← array de nombres, no objetos
}


export interface EmpleadoTurno {
  empleadoId: number;
  nombre: string;
  ventasRealizadas: number;
  totalVendido: number;
  turnoId: number;
turnoNombre: string;  
}

// ────────────────────────────────────────────────────────────────────────────
// ABRIR/CERRAR TURNO
// ────────────────────────────────────────────────────────────────────────────

export interface AbrirTurnoDTO {
  kioscoId: number;
  empleadoId: number;
  efectivoInicial: number;
  turnoId: number;
  observaciones?: string;
}

export interface CerrarTurnoDTO {
  turnoId : number;
  efectivoContado: number;
  virtualAcreditado: number;
  observaciones?: string;
}

// ────────────────────────────────────────────────────────────────────────────
// CIERRE DE TURNO (Detalle completo)
// ────────────────────────────────────────────────────────────────────────────

export interface CierreTurnoResponse {
  cierreTurnoId: number;
  fecha: string;
  fechaFormateada: string;
  estado: number;
  estadoNombre: string;

  // Montos del cierre
  efectivoInicial: number;
  efectivoFinal: number;
  virtualFinal: number;
  montoEsperado: number;
  montoReal: number;
  diferencia: number;

  // Estadísticas
  cantidadVentas: number;
  totalVentas: number;
  totalEfectivo: number;
  totalVirtual: number;
  totalGastos: number;

  // Info extra
  observaciones: string;
  kioscoId: number;
  kioscoNombre: string;
  empleados: {
    empleadoId: number;
    empleadoNombre: string;
  }[];
}