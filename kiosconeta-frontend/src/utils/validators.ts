// ════════════════════════════════════════════════════════════════════════════
// UTILS: Validators (Validaciones de formularios)
// ════════════════════════════════════════════════════════════════════════════

// ────────────────────────────────────────────────────────────────────────────
// VALIDAR EMAIL
// ────────────────────────────────────────────────────────────────────────────

/**
 * Valida formato de email
 * @param email - Email a validar
 * @returns true si es válido
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// ────────────────────────────────────────────────────────────────────────────
// VALIDAR PIN
// ────────────────────────────────────────────────────────────────────────────

/**
 * Valida que el PIN sea de 4-6 dígitos
 * @param pin - PIN a validar
 * @returns true si es válido
 */
export const isValidPin = (pin: string): boolean => {
  const pinRegex = /^\d{4,6}$/;
  return pinRegex.test(pin);
};

/**
 * Valida que el PIN tenga exactamente 4 dígitos
 * @param pin - PIN a validar
 * @returns true si es válido
 */
export const isValid4DigitPin = (pin: string): boolean => {
  const pinRegex = /^\d{4}$/;
  return pinRegex.test(pin);
};

// ────────────────────────────────────────────────────────────────────────────
// VALIDAR NÚMEROS
// ────────────────────────────────────────────────────────────────────────────

/**
 * Valida que un valor sea un número positivo
 * @param value - Valor a validar
 * @returns true si es positivo
 */
export const isPositiveNumber = (value: number): boolean => {
  return !isNaN(value) && value > 0;
};

/**
 * Valida que un valor sea un número no negativo (0 o mayor)
 * @param value - Valor a validar
 * @returns true si es no negativo
 */
export const isNonNegativeNumber = (value: number): boolean => {
  return !isNaN(value) && value >= 0;
};

/**
 * Valida que un precio sea válido
 * @param precio - Precio a validar
 * @returns true si es válido (positivo y con máximo 2 decimales)
 */
export const isValidPrice = (precio: number): boolean => {
  if (!isPositiveNumber(precio)) return false;
  
  // Verificar que no tenga más de 2 decimales
  const decimals = precio.toString().split('.')[1];
  return !decimals || decimals.length <= 2;
};

// ────────────────────────────────────────────────────────────────────────────
// VALIDAR STOCK
// ────────────────────────────────────────────────────────────────────────────

/**
 * Valida que haya stock suficiente
 * @param stockDisponible - Stock actual
 * @param cantidadRequerida - Cantidad a vender/usar
 * @returns true si hay stock suficiente
 */
export const hasEnoughStock = (
  stockDisponible: number,
  cantidadRequerida: number
): boolean => {
  return stockDisponible >= cantidadRequerida;
};

// ────────────────────────────────────────────────────────────────────────────
// VALIDAR STRINGS
// ────────────────────────────────────────────────────────────────────────────

/**
 * Valida que un string no esté vacío
 * @param value - String a validar
 * @returns true si no está vacío
 */
export const isNotEmpty = (value: string): boolean => {
  return value.trim().length > 0;
};

/**
 * Valida longitud mínima de un string
 * @param value - String a validar
 * @param minLength - Longitud mínima
 * @returns true si cumple con la longitud
 */
export const hasMinLength = (value: string, minLength: number): boolean => {
  return value.trim().length >= minLength;
};

/**
 * Valida longitud máxima de un string
 * @param value - String a validar
 * @param maxLength - Longitud máxima
 * @returns true si cumple con la longitud
 */
export const hasMaxLength = (value: string, maxLength: number): boolean => {
  return value.trim().length <= maxLength;
};

// ────────────────────────────────────────────────────────────────────────────
// VALIDAR PASSWORD
// ────────────────────────────────────────────────────────────────────────────

/**
 * Valida requisitos mínimos de password
 * @param password - Password a validar
 * @returns true si cumple con los requisitos (mínimo 6 caracteres)
 */
export const isValidPassword = (password: string): boolean => {
  return password.length >= 6;
};

/**
 * Valida que dos passwords coincidan
 * @param password - Password original
 * @param confirmPassword - Confirmación del password
 * @returns true si coinciden
 */
export const passwordsMatch = (
  password: string,
  confirmPassword: string
): boolean => {
  return password === confirmPassword;
};

// ────────────────────────────────────────────────────────────────────────────
// VALIDAR FECHAS
// ────────────────────────────────────────────────────────────────────────────

/**
 * Valida que una fecha sea válida
 * @param dateString - Fecha en formato ISO
 * @returns true si es válida
 */
export const isValidDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
};

/**
 * Valida que una fecha sea futura
 * @param dateString - Fecha en formato ISO
 * @returns true si es futura
 */
export const isFutureDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  const now = new Date();
  return date > now;
};

/**
 * Valida que una fecha esté en un rango
 * @param dateString - Fecha a validar
 * @param fromDate - Fecha desde
 * @param toDate - Fecha hasta
 * @returns true si está en el rango
 */
export const isDateInRange = (
  dateString: string,
  fromDate: string,
  toDate: string
): boolean => {
  const date = new Date(dateString);
  const from = new Date(fromDate);
  const to = new Date(toDate);
  
  return date >= from && date <= to;
};

// ────────────────────────────────────────────────────────────────────────────
// VALIDAR TELÉFONO
// ────────────────────────────────────────────────────────────────────────────

/**
 * Valida formato de teléfono argentino
 * @param phone - Teléfono a validar
 * @returns true si es válido (10 dígitos)
 */
export const isValidPhone = (phone: string): boolean => {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length === 10;
};

// ────────────────────────────────────────────────────────────────────────────
// VALIDAR CÓDIGO DE BARRAS
// ────────────────────────────────────────────────────────────────────────────

/**
 * Valida que sea un código de barras válido
 * @param barcode - Código de barras
 * @returns true si tiene formato válido (8-13 dígitos)
 */
export const isValidBarcode = (barcode: string): boolean => {
  const cleaned = barcode.replace(/\D/g, '');
  return cleaned.length >= 8 && cleaned.length <= 13;
};

// ────────────────────────────────────────────────────────────────────────────
// MENSAJES DE ERROR
// ────────────────────────────────────────────────────────────────────────────

export const errorMessages = {
  required: 'Este campo es requerido',
  invalidEmail: 'Email inválido',
  invalidPin: 'El PIN debe tener entre 4 y 6 dígitos',
  invalidPin4: 'El PIN debe tener exactamente 4 dígitos',
  invalidPhone: 'Teléfono inválido (10 dígitos)',
  invalidPrice: 'Precio inválido',
  invalidPassword: 'La contraseña debe tener al menos 6 caracteres',
  passwordsNotMatch: 'Las contraseñas no coinciden',
  insufficientStock: 'Stock insuficiente',
  invalidDate: 'Fecha inválida',
  minLength: (min: number) => `Mínimo ${min} caracteres`,
  maxLength: (max: number) => `Máximo ${max} caracteres`,
  positiveNumber: 'Debe ser un número positivo',
};