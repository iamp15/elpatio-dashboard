/**
 * Hook para gestionar permisos del usuario
 * Proporciona funciones para verificar acceso a funcionalidades
 */

import { getUserInfo } from '../services/auth'
import { verificarPermiso, NIVELES_ROL } from '../config/permisos'

/**
 * Hook para verificar permisos del usuario actual
 * Utiliza el rol almacenado en el token JWT (sin llamada a API)
 * 
 * @returns {Object} Funciones y datos de permisos
 */
export function usePermisos() {
  // Obtener rol directamente del token (más rápido, sin esperar API)
  const userInfo = getUserInfo()
  const rol = userInfo?.rol || null

  /**
   * Verifica si el usuario tiene un permiso específico
   * @param {string} permiso - Nombre del permiso (ej: 'ADMINS_CREAR')
   * @returns {boolean}
   */
  const tienePermiso = (permiso) => {
    return verificarPermiso(rol, permiso)
  }

  /**
   * Verifica si el usuario es superadmin
   * @returns {boolean}
   */
  const esSuperadmin = () => {
    return rol === 'superadmin'
  }

  /**
   * Verifica si el usuario es admin o superior
   * @returns {boolean}
   */
  const esAdmin = () => {
    return ['admin', 'superadmin'].includes(rol)
  }

  /**
   * Verifica si el usuario tiene un nivel de rol mínimo
   * @param {string} rolMinimo - Rol mínimo requerido
   * @returns {boolean}
   */
  const tieneNivelMinimo = (rolMinimo) => {
    if (!rol) return false
    const nivelUsuario = NIVELES_ROL[rol] || 0
    const nivelRequerido = NIVELES_ROL[rolMinimo] || 0
    return nivelUsuario >= nivelRequerido
  }

  return {
    rol,
    tienePermiso,
    esSuperadmin,
    esAdmin,
    tieneNivelMinimo,
  }
}
