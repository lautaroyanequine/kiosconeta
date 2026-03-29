// ════════════════════════════════════════════════════════════════════════════
// TYPES: Empleados
// ════════════════════════════════════════════════════════════════════════════

// ────────────────────────────────────────────────────────────────────────────
// EMPLEADO (Entity completa)
// ────────────────────────────────────────────────────────────────────────────

export interface Empleado {
  empleadoId: number;
  nombre: string;
  legajo?: string;
  telefono?: string;
  esAdmin: boolean;
  activo: boolean;
  kioscoId: number;
  kioscoID?: number;       // backend devuelve kioscoID (mayúscula)
  usuarioID?: number | null; // backend: si tiene usuario = es admin
  cantidadVentas?: number;
  permisos?: Permiso[];
}

// ────────────────────────────────────────────────────────────────────────────
// CREAR/EDITAR EMPLEADO
// ────────────────────────────────────────────────────────────────────────────

export interface CreateEmpleadoDTO {
  nombre: string;
  legajo?: string;
  telefono?: string;
  pin?: string;               // 4-6 dígitos
  esAdmin: boolean;
  kioscoId: number;
}

export interface UpdateEmpleadoDTO {
  empleadoId: number;
  nombre?: string;
  legajo?: string;
  telefono?: string;
  activo?: boolean;
}

// ────────────────────────────────────────────────────────────────────────────
// PERMISOS
// ────────────────────────────────────────────────────────────────────────────

export interface Permiso {
  permisoId: number;
  nombre: string;             // Ej: "productos.crear"
  descripcion: string;
  categoria: string;          // Ej: "productos", "ventas"
}

export interface EmpleadoConPermisos {
  empleadoId: number;
  nombre: string;
  legajo?: string;
  esAdmin: boolean;
  permisos: Permiso[];
}

export interface AsignarPermisosDTO {
  empleadoId: number;
  permisosIds: number[];
}

// ────────────────────────────────────────────────────────────────────────────
// ROLES (Plantillas predefinidas)
// ────────────────────────────────────────────────────────────────────────────

export const Rol = {
  Admin: 'Admin',
  Gerente: 'Gerente',
  Cajero: 'Cajero',
  Repositor: 'Repositor',
} as const

export type Rol = typeof Rol[keyof typeof Rol]

export interface PlantillaRol {
  rol: string;
  descripcion: string;
  permisosIds: number[];   // backend devuelve IDs, no objetos
}

// Plantilla custom creada por el admin — guardada en localStorage
export interface PlantillaCustom {
  id: string;              // uuid generado en frontend
  nombre: string;
  descripcion?: string;
  permisosIds: number[];
  creadaEn: string;        // ISO date
}