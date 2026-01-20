/**
 * Servicio de autenticación
 * Maneja login, logout y gestión de tokens JWT
 */

const TOKEN_KEY = 'elpatio_admin_token'
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

/**
 * Obtener token del localStorage
 */
export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY)
}

/**
 * Guardar token en localStorage
 */
const setToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token)
}

/**
 * Eliminar token del localStorage
 */
const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY)
}

/**
 * Verificar si el usuario está autenticado
 */
export const isAuthenticated = () => {
  const token = getToken()
  if (!token) return false

  try {
    // Decodificar el token JWT (solo para verificar expiración básica)
    const payload = JSON.parse(atob(token.split('.')[1]))
    const now = Date.now() / 1000

    // Verificar si el token no ha expirado
    if (payload.exp && payload.exp < now) {
      removeToken()
      return false
    }

    return true
  } catch (error) {
    console.error('Error verificando token:', error)
    removeToken()
    return false
  }
}

/**
 * Login de administrador
 */
export const login = async (email, password) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.mensaje || 'Error al iniciar sesión')
    }

    if (data.token) {
      setToken(data.token)
      return { success: true, token: data.token }
    }

    throw new Error('No se recibió token de autenticación')
  } catch (error) {
    console.error('Error en login:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Logout
 */
export const logout = () => {
  removeToken()
  
  // Desconectar WebSocket al cerrar sesión
  // Importación dinámica para evitar dependencia circular
  import('./websocket').then(module => {
    module.default.disconnect()
  }).catch(() => {
    // Si hay error, no hacer nada
  })
}

/**
 * Obtener información del usuario desde el token JWT
 */
export const getUserInfo = () => {
  const token = getToken()
  if (!token) return null

  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return {
      id: payload.id,
      email: payload.email,
      rol: payload.rol,
    }
  } catch (error) {
    console.error('Error decodificando token:', error)
    return null
  }
}

/**
 * Hook de autenticación (para usar en componentes)
 */
export const useAuth = () => {
  return {
    getToken,
    isAuthenticated,
    login,
    logout,
    getUserInfo,
  }
}
