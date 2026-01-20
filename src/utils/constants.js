/**
 * Constantes compartidas
 * Centraliza todas las constantes utilizadas en la aplicación
 */

/**
 * Mapeo de categorías de configuración a sus etiquetas
 * @param {string} categoria - Categoría de configuración
 * @returns {string} Etiqueta de la categoría
 */
export function getCategoriaLabel(categoria) {
  const labels = {
    depositos: 'Depósitos',
    retiros: 'Retiros',
    general: 'General',
    notificaciones: 'Notificaciones',
    seguridad: 'Seguridad',
  }
  return labels[categoria] || categoria
}

/**
 * Mapeo de estados de transacciones a variantes de badge
 */
export const TRANSACTION_BADGE_VARIANTS = {
  pendiente: 'pending',
  en_proceso: 'warning',
  completada: 'completed',
  completada_con_ajuste: 'success',
  rechazada: 'rejected',
  cancelada: 'cancelled',
  fallida: 'danger',
  revertida: 'default',
}

/**
 * Categorías de configuración disponibles
 */
export const CONFIG_CATEGORIES = {
  DEPOSITOS: 'depositos',
  RETIROS: 'retiros',
  GENERAL: 'general',
  NOTIFICACIONES: 'notificaciones',
  SEGURIDAD: 'seguridad',
}
