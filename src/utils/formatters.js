/**
 * Funciones de formateo de datos
 * Centraliza todas las funciones de formateo utilizadas en la aplicación
 */

/**
 * Formatea un monto en centavos como moneda venezolana
 * @param {number} amount - Monto en centavos
 * @returns {string} Monto formateado como moneda
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat('es-VE', {
    style: 'currency',
    currency: 'VES',
    minimumFractionDigits: 2,
  }).format((amount || 0) / 100)
}

/**
 * Formatea una fecha como string legible
 * @param {Date|string} date - Fecha a formatear
 * @returns {string} Fecha formateada o '-' si no hay fecha
 */
export function formatDate(date) {
  if (!date) return '-'
  return new Date(date).toLocaleString('es-VE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Formatea el rol del usuario para mostrar
 * @param {string} rol - Rol del usuario
 * @returns {string} Rol formateado
 */
export function formatRole(rol) {
  if (rol === 'superadmin') return 'Super Admin'
  if (rol === 'admin') return 'Admin'
  return rol
}

/**
 * Obtiene la variante del badge según el rol del usuario
 * @param {string} rol - Rol del usuario
 * @returns {string} Variante del badge
 */
export function getRoleBadgeVariant(rol) {
  if (rol === 'superadmin') return 'danger'
  if (rol === 'admin') return 'info'
  return 'default'
}

/**
 * Obtiene la variante del badge según el estado de la transacción
 * @param {string} estado - Estado de la transacción
 * @returns {string} Variante del badge
 */
export function getBadgeVariant(estado) {
  const map = {
    pendiente: 'pending',
    en_proceso: 'warning',
    completada: 'completed',
    completada_con_ajuste: 'success',
    rechazada: 'rejected',
    cancelada: 'cancelled',
    fallida: 'danger',
    revertida: 'default',
  }
  return map[estado] || 'default'
}

/**
 * Formatea un valor según su tipo de dato
 * @param {any} valor - Valor a formatear
 * @param {string} tipoDato - Tipo de dato ('number', 'boolean', 'string')
 * @returns {any} Valor formateado
 */
export function formatearValor(valor, tipoDato) {
  if (tipoDato === 'number') {
    return typeof valor === 'number' ? valor : parseFloat(valor) || 0
  }
  if (tipoDato === 'boolean') {
    return typeof valor === 'boolean' ? valor : valor === 'true' || valor === true
  }
  return valor
}
