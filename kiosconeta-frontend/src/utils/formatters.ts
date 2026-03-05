// ════════════════════════════════════════════════════════════════════════════
// UTILS: Formatters (Formatear datos para mostrar)
// ════════════════════════════════════════════════════════════════════════════

// ────────────────────────────────────────────────────────────────────────────
// FORMATEAR MONEDA
// ────────────────────────────────────────────────────────────────────────────

/**
 * Formatea un número como moneda argentina
 * @param amount - Monto a formatear
 * @returns String formateado: "$1.234,56"
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Formatea un número sin el símbolo de moneda
 * @param amount - Monto a formatear
 * @returns String formateado: "1.234,56"
 */
export const formatNumber = (amount: number): string => {
  return new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

// ────────────────────────────────────────────────────────────────────────────
// FORMATEAR FECHAS
// ────────────────────────────────────────────────────────────────────────────

/**
 * Formatea una fecha ISO a formato argentino
 * @param isoDate - Fecha en formato ISO (2025-02-23T14:32:00)
 * @returns String formateado: "23/02/2025"
 */
export const formatDate = (isoDate: string): string => {
  const date = new Date(isoDate);
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
};

/**
 * Formatea una fecha ISO con hora
 * @param isoDate - Fecha en formato ISO
 * @returns String formateado: "23/02/2025 14:32"
 */
export const formatDateTime = (isoDate: string): string => {
  const date = new Date(isoDate);
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

/**
 * Formatea solo la hora
 * @param isoDate - Fecha en formato ISO
 * @returns String formateado: "14:32"
 */
export const formatTime = (isoDate: string): string => {
  const date = new Date(isoDate);
  return new Intl.DateTimeFormat('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

/**
 * Formatea una fecha para input type="date"
 * @param date - Objeto Date o string ISO
 * @returns String formateado: "2025-02-23"
 */
export const formatDateForInput = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split('T')[0];
};

/**
 * Convierte string "DD/MM/YYYY" a formato ISO
 * @param dateString - Fecha en formato "23/02/2025"
 * @returns String ISO: "2025-02-23"
 */
export const parseArgentineDate = (dateString: string): string => {
  const [day, month, year] = dateString.split('/');
  return `${year}-${month}-${day}`;
};

// ────────────────────────────────────────────────────────────────────────────
// FORMATEAR TEXTO
// ────────────────────────────────────────────────────────────────────────────

/**
 * Capitaliza la primera letra de cada palabra
 * @param text - Texto a capitalizar
 * @returns String capitalizado: "Juan Pérez"
 */
export const capitalize = (text: string): string => {
  return text
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Trunca un texto largo
 * @param text - Texto a truncar
 * @param maxLength - Longitud máxima
 * @returns Texto truncado con "..."
 */
export const truncate = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

/**
 * Formatea un número de teléfono argentino
 * @param phone - Teléfono sin formato
 * @returns String formateado: "11 2345-6789"
 */
export const formatPhone = (phone: string): string => {
  // Remover caracteres no numéricos
  const cleaned = phone.replace(/\D/g, '');
  
  // Formato: XX XXXX-XXXX (para 10 dígitos)
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
  }
  
  // Si no es 10 dígitos, devolver sin formato
  return phone;
};

// ────────────────────────────────────────────────────────────────────────────
// FORMATEAR PORCENTAJES
// ────────────────────────────────────────────────────────────────────────────

/**
 * Formatea un número como porcentaje
 * @param value - Valor decimal (0.15 para 15%)
 * @returns String formateado: "15%"
 */
export const formatPercentage = (value: number): string => {
  return `${(value * 100).toFixed(0)}%`;
};

/**
 * Formatea un cambio porcentual con signo
 * @param value - Valor del cambio (15, -5, etc.)
 * @returns String formateado: "+15%" o "-5%"
 */
export const formatChangePercentage = (value: number): string => {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(0)}%`;
};

// ────────────────────────────────────────────────────────────────────────────
// FORMATEAR STOCK
// ────────────────────────────────────────────────────────────────────────────

/**
 * Obtiene el estado del stock según cantidad
 * @param stock - Stock actual
 * @param stockMinimo - Stock mínimo configurado
 * @returns 'critico' | 'bajo' | 'normal'
 */
export const getStockStatus = (
  stock: number,
  stockMinimo: number
): 'critico' | 'bajo' | 'normal' => {
  if (stock === 0) return 'critico';
  if (stock < stockMinimo) return 'bajo';
  return 'normal';
};

/**
 * Obtiene el texto descriptivo del stock
 * @param stock - Stock actual
 * @param stockMinimo - Stock mínimo
 * @returns Descripción del estado
 */
export const getStockLabel = (stock: number, stockMinimo: number): string => {
  const status = getStockStatus(stock, stockMinimo);
  
  switch (status) {
    case 'critico':
      return 'Sin stock';
    case 'bajo':
      return 'Stock bajo';
    default:
      return 'Stock OK';
  }
};