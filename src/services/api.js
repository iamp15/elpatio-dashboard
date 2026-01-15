/**
 * Cliente API para comunicación con el backend
 * Maneja autenticación automática y manejo de errores
 */

import { getToken, logout } from './auth'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

/**
 * Realizar petición HTTP autenticada
 */
const request = async (endpoint, options = {}) => {
  const token = getToken()
  const url = `${API_BASE_URL}${endpoint}`

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    })

    // Si recibe 401, el token es inválido o expiró
    if (response.status === 401) {
      logout()
      window.location.href = '/login'
      throw new Error('Sesión expirada. Por favor inicia sesión nuevamente.')
    }

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.mensaje || data.error || 'Error en la petición')
    }

    return data
  } catch (error) {
    console.error(`Error en petición ${endpoint}:`, error)
    throw error
  }
}

/**
 * Obtener estadísticas globales
 */
export const getStatsGlobales = async () => {
  return request('/api/admin/stats')
}

/**
 * Obtener estadísticas por fecha
 */
export const getStatsPorFecha = async (fechaInicio, fechaFin) => {
  const params = new URLSearchParams()
  if (fechaInicio) params.append('inicio', fechaInicio)
  if (fechaFin) params.append('fin', fechaFin)
  
  return request(`/api/admin/stats/fecha?${params.toString()}`)
}

/**
 * Obtener estadísticas de conexiones
 */
export const getConnectionStats = async () => {
  return request('/api/admin/connection-stats')
}

/**
 * Obtener todas las transacciones
 */
export const getTransacciones = async (filtros = {}) => {
  const params = new URLSearchParams()
  
  Object.keys(filtros).forEach(key => {
    if (filtros[key] !== undefined && filtros[key] !== null && filtros[key] !== '') {
      params.append(key, filtros[key])
    }
  })

  const queryString = params.toString()
  return request(`/api/transacciones/admin/todas${queryString ? `?${queryString}` : ''}`)
}

/**
 * Obtener transacciones en curso
 */
export const getTransaccionesEnCurso = async (limite = 50, categoria = null) => {
  const params = new URLSearchParams()
  params.append('limite', limite.toString())
  if (categoria) params.append('categoria', categoria)

  return request(`/api/transacciones/admin/en-curso?${params.toString()}`)
}

/**
 * Obtener estadísticas del sistema de transacciones
 */
export const getEstadisticasSistema = async (fechaInicio = null, fechaFin = null) => {
  const params = new URLSearchParams()
  if (fechaInicio) params.append('fechaInicio', fechaInicio)
  if (fechaFin) params.append('fechaFin', fechaFin)

  const queryString = params.toString()
  return request(`/api/transacciones/admin/estadisticas-sistema${queryString ? `?${queryString}` : ''}`)
}

/**
 * Obtener detalles de una transacción
 */
export const getTransaccionDetalles = async (transaccionId) => {
  return request(`/api/transacciones/${transaccionId}`)
}

/**
 * Obtener configuración de precios
 */
export const getPaymentConfig = async () => {
  return request('/api/payment-config')
}

/**
 * Actualizar configuración de precios
 */
export const updatePaymentConfig = async (configType, configKey, configValue) => {
  return request('/api/payment-config', {
    method: 'PUT',
    body: JSON.stringify({ configType, configKey, configValue }),
  })
}

/**
 * Obtener configuración del sistema
 */
export const getConfig = async (clave) => {
  return request(`/api/config/${clave}`)
}

/**
 * Actualizar configuración del sistema
 */
export const updateConfig = async (clave, valor) => {
  return request(`/api/config/${clave}`, {
    method: 'PUT',
    body: JSON.stringify({ valor }),
  })
}

/**
 * Obtener todas las configuraciones
 */
export const getAllConfigs = async () => {
  return request('/api/config')
}
