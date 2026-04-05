// ════════════════════════════════════════════════════════════════════════════
// UTILS: Constants (Constantes globales)
// ════════════════════════════════════════════════════════════════════════════

// ────────────────────────────────────────────────────────────────────────────
// API
// ────────────────────────────────────────────────────────────────────────────

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const API_ENDPOINTS = {
  // Auth
  LOGIN_ADMIN: '/auth/login-admin',
  LOGIN_EMPLEADO: '/auth/login-empleado',
  REGISTER: '/auth/register',
  EMPLEADOS_LOGIN: '/auth/empleados-login',
  CAMBIAR_PASSWORD: '/auth/cambiar-password',
  CAMBIAR_PIN: '/auth/cambiar-pin',
  ASIGNAR_PIN: '/auth/asignar-pin',
  VERIFICAR_TOKEN: '/auth/verificar',
  
  // Productos
  PRODUCTOS: '/productos',
  PRODUCTOS_BY_ID: (id: number) => `/productos/${id}`,
  PRODUCTOS_STOCK_BAJO: '/productos/stock-bajo',
  PRODUCTOS_ACTIVOS: '/productos/activos',
  
  // Categorías
  CATEGORIAS: '/categorias',
  CATEGORIAS_BY_ID: (id: number) => `/categorias/${id}`,
  
  // Ventas
  VENTAS: '/ventas',
  VENTAS_BY_ID: (id: number) => `/ventas/${id}`,
  VENTAS_EMPLEADO: (empleadoId: number) => `/ventas/empleado/${empleadoId}`,
  VENTAS_ANULAR: (id: number) => `/ventas/${id}/anular`,
  
  // Métodos de Pago
  METODOS_PAGO: '/MetodosDePago',
  METODOS_PAGO_ACTIVOS: '/MetodosDePago',
  
  // Gastos
  GASTOS: '/gastos',

  // Auditoría
  AUDITORIA_KIOSCO: (kioscoId: number) => `/auditoria/kiosco/${kioscoId}`,
  AUDITORIA_SOSPECHOSOS: (kioscoId: number) => `/auditoria/kiosco/${kioscoId}/sospechosos`,
  AUDITORIA_EMPLEADO: (empleadoId: number) => `/auditoria/empleado/${empleadoId}`,
  GASTOS_BY_ID: (id: number) => `/gastos/${id}`,
  TIPOS_GASTO: '/tipos-gasto',
  
  // Turnos
TURNOS: '/Turnos',                    // ← lista Mañana/Tarde/Noche (TurnosController)
TURNO_ACTUAL: (kioscoId: number) => `/CierreTurnos/kiosco/${kioscoId}/actual`,
TURNO_ABRIR: '/CierreTurnos/abrir',
TURNO_CERRAR: (kioscoId: number) => `/CierreTurnos/kiosco/${kioscoId}/cerrar`,
TURNO_DETALLE: (id: number) => `/CierreTurnos/${id}`,
TURNOS_KIOSCO: (kioscoId: number) => `/CierreTurnos/kiosco/${kioscoId}`,
  // Empleados
  EMPLEADOS: '/empleados',
  EMPLEADOS_BY_ID: (id: number) => `/empleados/${id}`,
  EMPLEADOS_ACTIVOS: '/empleados/activos',
  
  // Permisos
  PERMISOS: '/permisos',
  PERMISOS_EMPLEADO: (id: number) => `/permisos/empleado/${id}`,
  PERMISOS_ASIGNAR: '/permisos/asignar',
  PERMISOS_PLANTILLAS: '/permisos/plantillas',
  PERMISOS_ASIGNAR_ROL: '/permisos/asignar-rol',
  
  // Dashboard
  DASHBOARD: '/dashboard',
  
  // Configuración
  KIOSCO: '/kiosco',
};

// ────────────────────────────────────────────────────────────────────────────
// STORAGE KEYS (localStorage)
// ────────────────────────────────────────────────────────────────────────────

export const STORAGE_KEYS = {
  TOKEN: 'kiosconeta_token',           // token del empleado activo (se usa en las llamadas API)
  KIOSCO_TOKEN: 'kiosconeta_kiosco_token', // token del kiosco (configura la PC)
  KIOSCO_USER: 'kiosconeta_kiosco_user',   // datos del admin que configuró la PC
  USER: 'kiosconeta_user',
  KIOSCO_ID: 'kiosconeta_kiosco_id',
  TURNO_ID: 'kiosconeta_turno_id',
  EMPLEADO_ACTIVO: 'kiosconeta_empleado_activo',
  THEME: 'kiosconeta_theme',
  SIDEBAR_COLLAPSED: 'kiosconeta_sidebar_collapsed',
};

// ────────────────────────────────────────────────────────────────────────────
// RUTAS (paths del frontend)
// ────────────────────────────────────────────────────────────────────────────

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  SELECCION_EMPLEADO: '/seleccionar-empleado',
  POS: '/pos',
  PRODUCTOS: '/productos',
  CATEGORIAS: '/categorias',
  VENTAS: '/ventas',
  GASTOS: '/gastos',
  TURNOS: '/turnos',
  EMPLEADOS: '/empleados',
  CONFIGURACION: '/configuracion',
  AUDITORIA: '/auditoria',
  REPORTES: '/reportes',
  PERFIL: '/perfil',
};

// ────────────────────────────────────────────────────────────────────────────
// CONFIGURACIÓN DE UI
// ────────────────────────────────────────────────────────────────────────────

export const UI_CONFIG = {
  // Paginación
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
  
  // Debounce para búsqueda
  SEARCH_DEBOUNCE_MS: 300,
  
  // Sidebar
  SIDEBAR_WIDTH: 240,
  SIDEBAR_COLLAPSED_WIDTH: 80,
  
  // Modales
  MODAL_CLOSE_DELAY_MS: 300,
  
  // Toasts/Notificaciones
  TOAST_DURATION_MS: 3000,
  TOAST_SUCCESS_DURATION_MS: 2000,
  TOAST_ERROR_DURATION_MS: 5000,
  
  // Auto-refresh
  DASHBOARD_REFRESH_MS: 30000, // 30 segundos
  
  // POS
  POS_PRODUCTOS_FRECUENTES: 6,
};

// ────────────────────────────────────────────────────────────────────────────
// LÍMITES Y VALIDACIONES
// ────────────────────────────────────────────────────────────────────────────

export const LIMITS = {
  // Stock
  STOCK_MINIMO_DEFAULT: 10,
  STOCK_CRITICO_THRESHOLD: 5,
  
  // Precio
  PRECIO_MINIMO: 0.01,
  PRECIO_MAXIMO: 9999999.99,
  
  // Descuento
  DESCUENTO_MINIMO: 0,
  DESCUENTO_MAXIMO: 100,
  
  // Password
  PASSWORD_MIN_LENGTH: 6,
  PASSWORD_MAX_LENGTH: 50,
  
  // PIN
  PIN_MIN_LENGTH: 4,
  PIN_MAX_LENGTH: 6,
  
  // Texto
  NOMBRE_MAX_LENGTH: 100,
  DESCRIPCION_MAX_LENGTH: 500,
  OBSERVACIONES_MAX_LENGTH: 1000,
  
  // Teléfono
  TELEFONO_LENGTH: 10,
  
  // Código de barras
  BARCODE_MIN_LENGTH: 8,
  BARCODE_MAX_LENGTH: 13,
};

// ────────────────────────────────────────────────────────────────────────────
// FORMATOS
// ────────────────────────────────────────────────────────────────────────────

export const FORMATS = {
  // Fecha
  DATE_FORMAT: 'DD/MM/YYYY',
  DATETIME_FORMAT: 'DD/MM/YYYY HH:mm',
  TIME_FORMAT: 'HH:mm',
  
  // Moneda
  CURRENCY: 'ARS',
  CURRENCY_SYMBOL: '$',
  CURRENCY_DECIMALS: 2,
};

// ────────────────────────────────────────────────────────────────────────────
// COLORES (para gráficos y UI)
// ────────────────────────────────────────────────────────────────────────────

export const COLORS = {
  PRIMARY: '#402378',
  SECONDARY: '#F3CD40',
  SUCCESS: '#10B981',
  DANGER: '#EF4444',
  WARNING: '#F59E0B',
  INFO: '#3B82F6',
  NEUTRAL: '#6B7280',
};

// ────────────────────────────────────────────────────────────────────────────
// MENSAJES
// ────────────────────────────────────────────────────────────────────────────

export const MESSAGES = {
  // Éxito
  SUCCESS: {
    CREAR: 'Creado exitosamente',
    ACTUALIZAR: 'Actualizado exitosamente',
    ELIMINAR: 'Eliminado exitosamente',
    GUARDAR: 'Guardado exitosamente',
    LOGIN: 'Bienvenido',
    LOGOUT: 'Sesión cerrada',
  },
  
  // Error
  ERROR: {
    GENERIC: 'Ocurrió un error inesperado',
    NETWORK: 'Error de conexión. Verificá tu internet.',
    UNAUTHORIZED: 'No tenés permisos para esta acción',
    NOT_FOUND: 'No se encontró el recurso',
    VALIDATION: 'Por favor, revisá los campos del formulario',
    SESSION_EXPIRED: 'Tu sesión expiró. Por favor, iniciá sesión nuevamente.',
  },
  
  // Confirmación
  CONFIRM: {
    ELIMINAR: '¿Estás seguro de eliminar este elemento?',
    ANULAR_VENTA: '¿Estás seguro de anular esta venta?',
    CERRAR_TURNO: '¿Estás seguro de cerrar el turno?',
    SALIR: '¿Estás seguro de cerrar sesión?',
  },
};

// ────────────────────────────────────────────────────────────────────────────
// ROLES Y PERMISOS
// ────────────────────────────────────────────────────────────────────────────

export const ROLES = {
  ADMIN: 'Admin',
  GERENTE: 'Gerente',
  CAJERO: 'Cajero',
  REPOSITOR: 'Repositor',
} as const;

export const PERMISOS = {
  // Productos
  PRODUCTOS_VER: 'productos.ver',
  PRODUCTOS_CREAR: 'productos.crear',
  PRODUCTOS_EDITAR: 'productos.editar',
  PRODUCTOS_ELIMINAR: 'productos.eliminar',
  
  // Ventas
  VENTAS_CREAR: 'ventas.crear',
  VENTAS_VER_TODAS: 'ventas.ver_todas',
  VENTAS_VER_PROPIAS: 'ventas.ver_propias',
  VENTAS_ANULAR: 'ventas.anular',
  
  // Gastos
  GASTOS_CREAR: 'gastos.crear',
  GASTOS_VER_TODOS: 'gastos.ver_todos',
  GASTOS_VER_PROPIOS: 'gastos.ver_propios',
  
  // Turnos
  TURNOS_ABRIR: 'turnos.abrir',
  TURNOS_CERRAR: 'turnos.cerrar',
  TURNOS_VER_TODOS: 'turnos.ver_todos',
  
  // Empleados
  EMPLEADOS_VER: 'empleados.ver',
  EMPLEADOS_CREAR: 'empleados.crear',
  EMPLEADOS_EDITAR: 'empleados.editar',
  EMPLEADOS_ASIGNAR_PERMISOS: 'empleados.asignar_permisos',
  
  // Reportes
  REPORTES_DASHBOARD_COMPLETO: 'reportes.dashboard_completo',
  REPORTES_DASHBOARD_BASICO: 'reportes.dashboard_basico',
  
  // Configuración
  CONFIGURACION_KIOSCO: 'configuracion.kiosco',
} as const;