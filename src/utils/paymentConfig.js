/**
 * Utilidades y constantes para PaymentConfig
 * Maneja conversiones, validaciones y mapeo de configKeys
 */

/**
 * Tipos de configuración disponibles
 */
export const CONFIG_TYPES = {
  PRECIOS: 'precios',
  LIMITES: 'limites',
  COMISIONES: 'comisiones',
  MONEDA: 'moneda'
}

/**
 * Mapeo de configKeys a descripciones legibles
 */
export const CONFIG_DESCRIPTIONS = {
  // Precios - Ludo
  'ludo.1v1': 'Precio entrada Ludo 1v1',
  'ludo.2v2': 'Precio entrada Ludo 2v2',
  'ludo.1v1v1': 'Precio entrada Ludo 1v1v1',
  'ludo.1v1v1v1': 'Precio entrada Ludo 1v1v1v1',
  
  // Precios - Dominó
  'domino.1v1': 'Precio entrada Dominó 1v1',
  'domino.2v2': 'Precio entrada Dominó 2v2',
  'domino.1v1v1': 'Precio entrada Dominó 1v1v1',
  'domino.1v1v1v1': 'Precio entrada Dominó 1v1v1v1',
  
  // Límites - Depósitos
  'deposito.minimo': 'Depósito mínimo',
  'deposito.maximo': 'Depósito máximo',
  'deposito.timeout.pendiente': 'Tiempo de vencimiento para depósitos pendientes (minutos)',
  'deposito.timeout.en_proceso': 'Tiempo de vencimiento para depósitos en proceso (minutos)',
  
  // Límites - Retiros
  'retiro.minimo': 'Retiro mínimo',
  'retiro.maximo': 'Retiro máximo',
  'balance.maximo': 'Balance máximo permitido',
  'retiros.diarios': 'Máximo retiros por día',
  'retiros.semanales': 'Máximo retiros por semana',
  
  // Comisiones - Retiros por frecuencia semanal
  'retiro.frecuencia_semanal.primera_vez': 'Comisión 1er retiro semanal (%)',
  'retiro.frecuencia_semanal.segunda_vez': 'Comisión 2do retiro semanal (%)',
  'retiro.frecuencia_semanal.tercera_vez': 'Comisión 3er retiro semanal (%)',
  'retiro.frecuencia_semanal.adicional': 'Comisión retiros adicionales (%)',
  'retiro.frecuencia_semanal.periodo_dias': 'Período de reinicio (días)',
  
  // Comisiones - Fijas
  'retiro.comision_fija': 'Comisión fija por retiro',
  'deposito.comision': 'Comisión por depósito (%)',
  'porcentaje_ganancias': 'Porcentaje de ganancias',
  
  // Moneda
  'codigo': 'Código ISO de la moneda',
  'simbolo': 'Símbolo de la moneda',
  'formato': 'Formato de número',
  'decimales': 'Número de decimales'
}

/**
 * Obtiene la descripción legible de una configKey
 */
export function getConfigDescription(configKey) {
  return CONFIG_DESCRIPTIONS[configKey] || configKey.replace(/_/g, ' ').replace(/\./g, ' → ')
}

/**
 * Convierte bolívares a centavos
 * @param {number|string} bolivares - Valor en bolívares
 * @returns {number} Valor en centavos
 */
export function convertirBolivaresACentavos(bolivares) {
  const valor = parseFloat(bolivares)
  
  if (isNaN(valor) || valor < 0) {
    throw new Error('El valor debe ser un número positivo')
  }
  
  const centavos = Math.round(valor * 100)
  
  if (!Number.isInteger(centavos)) {
    throw new Error('El valor debe ser un número entero después de la conversión')
  }
  
  return centavos
}

/**
 * Convierte centavos a bolívares
 * @param {number} centavos - Valor en centavos
 * @returns {number} Valor en bolívares
 */
export function convertirCentavosABolivares(centavos) {
  if (typeof centavos !== 'number' || isNaN(centavos)) {
    return 0
  }
  return centavos / 100
}

/**
 * Determina si un configKey requiere conversión de moneda
 */
export function requiereConversionMoneda(configType, configKey) {
  // Valores monetarios que requieren conversión
  if (configType === CONFIG_TYPES.PRECIOS) {
    return true
  }
  
  if (configType === CONFIG_TYPES.LIMITES) {
    // Excluir retiros.diarios, retiros.semanales y timeouts de depósitos
    if (configKey.startsWith('retiros.') || configKey.startsWith('deposito.timeout.')) {
      return false
    }
    // Todos los demás límites requieren conversión (son montos monetarios)
    return true
  }
  
  if (configType === CONFIG_TYPES.COMISIONES) {
    // Solo comision_fija requiere conversión (es un monto fijo)
    return configKey === 'retiro.comision_fija'
  }
  
  return false
}

/**
 * Determina si un configKey es un porcentaje
 */
export function esPorcentaje(configType, configKey) {
  if (configType === CONFIG_TYPES.COMISIONES) {
    // Todos los porcentajes excepto comision_fija y periodo_dias
    if (configKey === 'retiro.comision_fija' || configKey === 'retiro.frecuencia_semanal.periodo_dias') {
      return false
    }
    return true
  }
  return false
}

/**
 * Determina si un configKey es una cantidad (no monetaria)
 */
export function esCantidad(configType, configKey) {
  if (configType === CONFIG_TYPES.LIMITES) {
    return configKey.startsWith('retiros.') || configKey.startsWith('deposito.timeout.')
  }
  
  if (configType === CONFIG_TYPES.COMISIONES) {
    return configKey === 'retiro.frecuencia_semanal.periodo_dias'
  }
  
  if (configType === CONFIG_TYPES.MONEDA) {
    return configKey === 'decimales'
  }
  
  return false
}

/**
 * Valida un valor según su tipo de configuración
 */
export function validarValor(configType, configKey, valor) {
  // Convertir a número si es necesario
  const valorNum = typeof valor === 'string' ? parseFloat(valor) : valor
  
  // Validar valores monetarios (en centavos)
  if (requiereConversionMoneda(configType, configKey)) {
    if (!Number.isInteger(valorNum) || valorNum < 0) {
      return {
        valido: false,
        mensaje: 'El valor debe ser un número entero positivo (en centavos)'
      }
    }
  }
  
  // Validar porcentajes
  if (esPorcentaje(configType, configKey)) {
    if (isNaN(valorNum) || valorNum < 0 || valorNum > 100) {
      return {
        valido: false,
        mensaje: 'El porcentaje debe estar entre 0 y 100'
      }
    }
  }
  
  // Validar cantidades
  if (esCantidad(configType, configKey)) {
    if (!Number.isInteger(valorNum) || valorNum < 1) {
      return {
        valido: false,
        mensaje: 'La cantidad debe ser un número entero positivo'
      }
    }
    
    // Validaciones específicas
    if (configKey === 'retiros.diarios' && valorNum > 10) {
      return {
        valido: false,
        mensaje: 'El máximo de retiros diarios no puede ser mayor a 10'
      }
    }
    
    if (configKey === 'retiros.semanales' && valorNum > 20) {
      return {
        valido: false,
        mensaje: 'El máximo de retiros semanales no puede ser mayor a 20'
      }
    }
    
    if (configKey === 'decimales' && (valorNum < 0 || valorNum > 4)) {
      return {
        valido: false,
        mensaje: 'El número de decimales debe estar entre 0 y 4'
      }
    }
    
    // Validaciones para timeouts de depósitos
    if (configKey === 'deposito.timeout.pendiente' || configKey === 'deposito.timeout.en_proceso') {
      if (valorNum < 1 || valorNum > 30) {
        return {
          valido: false,
          mensaje: 'El tiempo de vencimiento debe estar entre 1 y 30 minutos'
        }
      }
    }
  }
  
  // Validar moneda - código
  if (configKey === 'codigo') {
    if (typeof valor !== 'string' || valor.length !== 3) {
      return {
        valido: false,
        mensaje: 'El código de moneda debe tener 3 caracteres'
      }
    }
  }
  
  return { valido: true }
}

/**
 * Formatea un valor para mostrar en la UI
 */
export function formatearValorParaUI(configType, configKey, valor) {
  if (valor === null || valor === undefined) {
    return '-'
  }
  
  // Valores monetarios: mostrar en bolívares
  if (requiereConversionMoneda(configType, configKey)) {
    const bolivares = convertirCentavosABolivares(valor)
    return `${bolivares.toLocaleString('es-VE')} Bs`
  }
  
  // Porcentajes: mostrar con símbolo %
  if (esPorcentaje(configType, configKey)) {
    return `${valor}%`
  }
  
  // Cantidades: mostrar con unidad si aplica
  if (configKey === 'retiros.diarios' || configKey === 'retiros.semanales') {
    return `${valor} retiro${valor !== 1 ? 's' : ''}`
  }
  
  if (configKey === 'retiro.frecuencia_semanal.periodo_dias') {
    return `${valor} día${valor !== 1 ? 's' : ''}`
  }
  
  // Timeouts de depósitos: mostrar en minutos
  if (configKey === 'deposito.timeout.pendiente' || configKey === 'deposito.timeout.en_proceso') {
    return `${valor} minuto${valor !== 1 ? 's' : ''}`
  }
  
  // Por defecto: mostrar tal cual
  return valor
}

/**
 * Obtiene el tipo de input apropiado para una configuración
 */
export function getInputType(configType, configKey) {
  if (configType === CONFIG_TYPES.MONEDA && configKey === 'codigo') {
    return 'text'
  }
  
  if (configType === CONFIG_TYPES.MONEDA && configKey === 'simbolo') {
    return 'text'
  }
  
  if (configType === CONFIG_TYPES.MONEDA && configKey === 'formato') {
    return 'text'
  }
  
  return 'number'
}

/**
 * Obtiene el placeholder para un input
 */
export function getInputPlaceholder(configType, configKey) {
  if (requiereConversionMoneda(configType, configKey)) {
    return 'Ej: 700 (en bolívares)'
  }
  
  if (esPorcentaje(configType, configKey)) {
    return 'Ej: 1 (porcentaje)'
  }
  
  if (esCantidad(configType, configKey)) {
    if (configKey.startsWith('deposito.timeout.')) {
      return 'Ej: 10 (en minutos)'
    }
    return 'Ej: 3'
  }
  
  return ''
}
