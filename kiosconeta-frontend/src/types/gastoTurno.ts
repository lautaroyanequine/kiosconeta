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


// Respuesta de un gasto
export interface GastoResponse {
  gastoId: number
  nombre: string
  descripcion: string
  monto: number
  fecha: string
  fechaFormateada: string
  empleadoId: number
  empleadoNombre: string
  kioscoId: number
  kioscoNombre: string
  tipoDeGastoId: number
  tipoDeGastoNombre: string
  cierreTurnoId: number | null
}

export interface CreateGastoDTO {
  nombre : string 
  descripcion: string
  monto: number
  empleadoId: number
  tipoDeGastoId: number
  cierreTurnoId?: number   // opcional — null si es gasto admin
}

// ────────────────────────────────────────────────────────────────────────────
// TIPO DE GASTO
// ────────────────────────────────────────────────────────────────────────────

// Tipo de gasto
export interface TipoDeGasto {
  tipoDeGastoId: number
  nombre: string
  descripcion: string
  activo: boolean
  cantidadGastos: number
  totalGastos: number
}

export interface CreateTipoDeGastoDTO {
  nombre: string;
  descripcion: string;
  kioscoId: number;
}
// ────────────────────────────────────────────────────────────────────────────
// TURNO
// ────────────────────────────────────────────────────────────────────────────

export interface Turno {
  turnoId: number;
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
  turnoId: number;       
  turnoNombre: string
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
  turnoId: number
  turnoNombre: string
  efectivoContado: number
  virtualAcreditado: number
  observaciones?: string
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
  turnoId: number;       
  turnoNombre: string
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

  fechaCierre: string | null
  fechaCierreFormateada: string | null
  gananciaTotal: number

  // Info extra
  observaciones: string;
  kioscoId: number;
  kioscoNombre: string;
  empleados: {
    empleadoId: number;
    empleadoNombre: string;
  }[];
}