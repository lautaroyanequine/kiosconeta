// ════════════════════════════════════════════════════════════════════════════
// TYPES: Autenticación
// ════════════════════════════════════════════════════════════════════════════

// ────────────────────────────────────────────────────────────────────────────
// USER (Datos del usuario logueado)
// ────────────────────────────────────────────────────────────────────────────

export interface User {
  empleadoId: number;
  nombre: string;
  email?: string;           // Solo si es admin
  esAdmin: boolean;
  kioscoId: number;
  legajo?: string;
}

// ────────────────────────────────────────────────────────────────────────────
// LOGIN (DTOs para login)
// ────────────────────────────────────────────────────────────────────────────

export interface LoginAdminDTO {
  email: string;
  password: string;
}

export interface LoginEmpleadoDTO {
  empleadoId?: number;      // Opcional: puede usar legajo
  legajo?: string;          // Opcional: puede usar empleadoId
  pin: string;              // 4-6 dígitos
}

// ────────────────────────────────────────────────────────────────────────────
// RESPONSE (Lo que devuelve el backend)
// ────────────────────────────────────────────────────────────────────────────

export interface AuthResponse {
  empleadoId: number;
  nombre: string;
  esAdmin: boolean;
  email: string | null;
  kioscoId: number;
  token: string;
  expiracion: string;       // ISO date string
  permisos: string[];       // nombres de permisos del empleado
}

// ────────────────────────────────────────────────────────────────────────────
// EMPLEADO PARA LOGIN (Lista de empleados disponibles)
// ────────────────────────────────────────────────────────────────────────────

export interface EmpleadoLoginDTO {
  empleadoId: number;
  nombre: string;
  legajo: string | null;
  esAdmin: boolean;
}

// ────────────────────────────────────────────────────────────────────────────
// CAMBIAR CREDENCIALES
// ────────────────────────────────────────────────────────────────────────────

export interface CambiarPasswordDTO {
  passwordActual: string;
  passwordNuevo: string;
}

export interface CambiarPinDTO {
  empleadoId: number;
  pinActual: string;
  pinNuevo: string;
}