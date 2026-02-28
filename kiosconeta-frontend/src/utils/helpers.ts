// ════════════════════════════════════════════════════════════════════════════
// UTILS: Helpers (Funciones utilitarias adicionales)
// ════════════════════════════════════════════════════════════════════════════

import { STORAGE_KEYS } from './constants';

// ────────────────────────────────────────────────────────────────────────────
// LOCAL STORAGE
// ────────────────────────────────────────────────────────────────────────────

/**
 * Guarda un valor en localStorage
 * @param key - Clave
 * @param value - Valor (se convierte a JSON automáticamente)
 */
export const setStorage = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

/**
 * Obtiene un valor de localStorage
 * @param key - Clave
 * @returns Valor parseado o null si no existe
 */
export const getStorage = <T>(key: string): T | null => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return null;
  }
};

/**
 * Elimina un valor de localStorage
 * @param key - Clave
 */
export const removeStorage = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing from localStorage:', error);
  }
};

/**
 * Limpia todo el localStorage de KIOSCONETA
 */
export const clearKiosconetaStorage = (): void => {
  Object.values(STORAGE_KEYS).forEach((key) => {
    removeStorage(key);
  });
};

// ────────────────────────────────────────────────────────────────────────────
// DEBOUNCE
// ────────────────────────────────────────────────────────────────────────────

/**
 * Debounce de una función
 * @param func - Función a ejecutar
 * @param delay - Delay en ms
 * @returns Función debounced
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
let timeoutId: ReturnType<typeof setTimeout>;  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// ────────────────────────────────────────────────────────────────────────────
// CALCULOS
// ────────────────────────────────────────────────────────────────────────────

/**
 * Calcula el subtotal de un item (precio × cantidad)
 * @param precio - Precio unitario
 * @param cantidad - Cantidad
 * @returns Subtotal
 */
export const calcularSubtotal = (precio: number, cantidad: number): number => {
  return Number((precio * cantidad).toFixed(2));
};

/**
 * Calcula el total con descuento
 * @param subtotal - Subtotal
 * @param descuento - Descuento (0-100 o monto fijo)
 * @param esPorcentaje - Si es porcentaje o monto fijo
 * @returns Total con descuento aplicado
 */
export const calcularTotal = (
  subtotal: number,
  descuento: number,
  esPorcentaje: boolean = true
): number => {
  if (esPorcentaje) {
    const montoDescuento = (subtotal * descuento) / 100;
    return Number((subtotal - montoDescuento).toFixed(2));
  }
  return Number((subtotal - descuento).toFixed(2));
};

/**
 * Calcula el porcentaje de cambio entre dos valores
 * @param valorActual - Valor actual
 * @param valorAnterior - Valor anterior
 * @returns Porcentaje de cambio
 */
export const calcularPorcentajeCambio = (
  valorActual: number,
  valorAnterior: number
): number => {
  if (valorAnterior === 0) return 0;
  return Number((((valorActual - valorAnterior) / valorAnterior) * 100).toFixed(2));
};

/**
 * Calcula el margen de ganancia
 * @param precioVenta - Precio de venta
 * @param precioCosto - Precio de costo
 * @returns Porcentaje de ganancia
 */
export const calcularMargenGanancia = (
  precioVenta: number,
  precioCosto: number
): number => {
  if (precioCosto === 0) return 0;
  return Number((((precioVenta - precioCosto) / precioCosto) * 100).toFixed(2));
};

// ────────────────────────────────────────────────────────────────────────────
// ARRAYS
// ────────────────────────────────────────────────────────────────────────────

/**
 * Agrupa un array por una propiedad
 * @param array - Array a agrupar
 * @param key - Propiedad por la cual agrupar
 * @returns Objeto con arrays agrupados
 */
export const groupBy = <T extends Record<string, any>>(
  array: T[],
  key: keyof T
): Record<string, T[]> => {
  return array.reduce((result, item) => {
    const groupKey = String(item[key]);
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {} as Record<string, T[]>);
};

/**
 * Ordena un array por una propiedad
 * @param array - Array a ordenar
 * @param key - Propiedad por la cual ordenar
 * @param order - Orden: 'asc' o 'desc'
 * @returns Array ordenado
 */
export const sortBy = <T extends Record<string, any>>(
  array: T[],
  key: keyof T,
  order: 'asc' | 'desc' = 'asc'
): T[] => {
  return [...array].sort((a, b) => {
    if (a[key] < b[key]) return order === 'asc' ? -1 : 1;
    if (a[key] > b[key]) return order === 'asc' ? 1 : -1;
    return 0;
  });
};

/**
 * Suma valores de una propiedad en un array
 * @param array - Array de objetos
 * @param key - Propiedad a sumar
 * @returns Suma total
 */
export const sumBy = <T extends Record<string, any>>(
  array: T[],
  key: keyof T
): number => {
  return array.reduce((sum, item) => sum + Number(item[key] || 0), 0);
};

// ────────────────────────────────────────────────────────────────────────────
// CLIPBOARD
// ────────────────────────────────────────────────────────────────────────────

/**
 * Copia texto al portapapeles
 * @param text - Texto a copiar
 * @returns Promise que resuelve cuando se copió
 */
export const copyToClipboard = async (text: string): Promise<void> => {
  try {
    await navigator.clipboard.writeText(text);
  } catch (error) {
    console.error('Error copying to clipboard:', error);
    throw error;
  }
};

// ────────────────────────────────────────────────────────────────────────────
// SLEEP (útil para delays en testing)
// ────────────────────────────────────────────────────────────────────────────

/**
 * Pausa la ejecución por X milisegundos
 * @param ms - Milisegundos a esperar
 * @returns Promise que resuelve después del delay
 */
export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

// ────────────────────────────────────────────────────────────────────────────
// GENERAR IDs ÚNICOS
// ────────────────────────────────────────────────────────────────────────────

/**
 * Genera un ID único simple
 * @returns String único basado en timestamp + random
 */
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// ────────────────────────────────────────────────────────────────────────────
// CLASE CSS CONDICIONAL
// ────────────────────────────────────────────────────────────────────────────

/**
 * Combina clases CSS de forma condicional
 * @param classes - Objeto con clases y condiciones
 * @returns String con clases a aplicar
 */
export const classNames = (
  ...classes: (string | undefined | null | false)[]
): string => {
  return classes.filter(Boolean).join(' ');
};

// ────────────────────────────────────────────────────────────────────────────
// GENERAR COLORES PARA GRÁFICOS
// ────────────────────────────────────────────────────────────────────────────

/**
 * Genera un array de colores para gráficos
 * @param count - Cantidad de colores
 * @returns Array de colores en formato hex
 */
export const generateChartColors = (count: number): string[] => {
  const baseColors = [
    '#402378', // Violeta
    '#F3CD40', // Naranja
    '#10B981', // Verde
    '#EF4444', // Rojo
    '#3B82F6', // Azul
    '#F59E0B', // Amarillo
    '#8B5CF6', // Púrpura
    '#EC4899', // Rosa
  ];
  
  // Si necesitamos más colores, repetir el patrón
  const colors = [];
  for (let i = 0; i < count; i++) {
    colors.push(baseColors[i % baseColors.length]);
  }
  
  return colors;
};