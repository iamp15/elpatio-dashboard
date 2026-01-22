/**
 * Configuración centralizada de permisos
 * Define qué roles pueden acceder a cada funcionalidad
 * 
 * Roles disponibles: 'admin', 'superadmin'
 * 
 * Para agregar un nuevo permiso:
 * 1. Agregar la constante aquí con los roles permitidos
 * 2. Usar tienePermiso('NOMBRE_PERMISO') en el componente
 */

export const PERMISOS = {
  // ==========================================
  // ADMINISTRACIÓN DE ADMINS (solo superadmin)
  // ==========================================
  ADMINS_SECCION: ['superadmin'],  // Acceso a la pestaña de admins
  ADMINS_VER: ['superadmin'],
  ADMINS_CREAR: ['superadmin'],
  ADMINS_MODIFICAR: ['superadmin'],
  ADMINS_ELIMINAR: ['superadmin'],

  // ==========================================
  // ADMINISTRACIÓN DE CAJEROS
  // ==========================================
  CAJEROS_SECCION: ['admin', 'superadmin'],  // Acceso a la pestaña de cajeros
  CAJEROS_VER: ['admin', 'superadmin'],
  CAJEROS_CREAR: ['admin', 'superadmin'],
  CAJEROS_MODIFICAR: ['admin', 'superadmin'],
  CAJEROS_ELIMINAR: ['admin', 'superadmin'],

  // ==========================================
  // CONFIGURACIÓN DEL SISTEMA
  // ==========================================
  CONFIG_VER: ['admin', 'superadmin'],
  CONFIG_MODIFICAR: ['superadmin'],

  // ==========================================
  // TRANSACCIONES
  // ==========================================
  TRANSACCIONES_VER: ['admin', 'superadmin'],
  TRANSACCIONES_CANCELAR: ['superadmin'],

  // ==========================================
  // SECCIÓN DE ADMINISTRACIÓN (menú completo)
  // ==========================================
  SECCION_ADMINISTRACION: ['admin', 'superadmin'],
}

/**
 * Niveles de rol (para comparaciones de jerarquía)
 * Mayor número = mayor nivel de acceso
 */
export const NIVELES_ROL = {
  admin: 3,
  superadmin: 4,
}

/**
 * Verifica si un rol tiene acceso a un permiso
 * @param {string} rol - Rol del usuario
 * @param {string} permiso - Nombre del permiso a verificar
 * @returns {boolean}
 */
export const verificarPermiso = (rol, permiso) => {
  if (!rol || !permiso) return false
  const rolesPermitidos = PERMISOS[permiso]
  if (!rolesPermitidos) {
    console.warn(`⚠️ Permiso no definido: ${permiso}`)
    return false
  }
  return rolesPermitidos.includes(rol)
}
