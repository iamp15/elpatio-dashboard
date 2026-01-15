/**
 * Servicio WebSocket para actualizaciones en tiempo real
 * Usa socket.io-client para conectar con el backend
 */

import { io } from 'socket.io-client'
import { getToken } from './auth'

const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

class WebSocketService {
  constructor() {
    this.socket = null
    this.listeners = new Map()
    this.isConnected = false
  }

  /**
   * Conectar al servidor WebSocket
   */
  connect() {
    if (this.socket?.connected) {
      console.log('✅ WebSocket ya está conectado')
      return
    }

    const token = getToken()
    if (!token) {
      console.warn('⚠️ No hay token, no se puede conectar al WebSocket')
      return
    }

    // Configurar listeners ANTES de conectar
    this.setupEventListeners()

    this.socket = io(WS_BASE_URL, {
      query: {
        token,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      autoConnect: true,
    })

    // Listener para resultado de autenticación
    this.socket.on('auth-result', (data) => {
      console.log('🔐 [WS] Resultado de autenticación:', data)
      if (data.success) {
        console.log('✅ [WS] Autenticación exitosa como:', data.user?.rol || data.userType)
        // Después de autenticarse, unirse al dashboard
        setTimeout(() => {
          if (this.socket?.connected && this.socket.id) {
            console.log('🔗 [WS] Uniéndose al dashboard...')
            this.socket.emit('unirse-dashboard')
          }
        }, 200)
        this.emit('authenticated', data)
      } else {
        console.error('❌ [WS] Error en autenticación:', data.message)
        this.emit('auth-error', data)
      }
    })

    this.socket.on('connect', () => {
      const socketId = this.socket.id
      console.log('✅ WebSocket conectado:', socketId)
      this.isConnected = true
      
      // Autenticarse automáticamente con el token
      const token = getToken()
      if (token) {
        console.log('🔐 [WS] Autenticando como admin...')
        // Intentar autenticar como cajero primero (admins también pueden usar auth-cajero)
        this.socket.emit('auth-cajero', { token })
      } else {
        console.warn('⚠️ [WS] No hay token para autenticación')
      }
      
      this.emit('connected', { socketId })
    })

    this.socket.on('disconnect', (reason) => {
      console.log('❌ WebSocket desconectado:', reason)
      this.isConnected = false
      this.emit('disconnected', { reason })
    })

    this.socket.on('connect_error', (error) => {
      console.error('❌ Error conectando WebSocket:', error)
      this.isConnected = false
      this.emit('error', { error: error.message })
    })

    this.socket.on('error', (error) => {
      console.error('❌ Error en WebSocket:', error)
      this.emit('error', { error: error.message || error })
    })
  }

  /**
   * Configurar listeners para eventos del servidor
   */
  setupEventListeners() {
    if (!this.socket) return

    // Evento de actualización de estado completo (emitido al room admin-dashboard)
    this.socket.on('estado-actualizado', (data) => {
      console.log('📊 [WS] Estado actualizado recibido:', data)
      console.log('📊 [WS] Estadísticas:', data?.estadisticas)
      this.emit('estado-actualizado', data)
    })

    // Evento de actualización de estadísticas
    this.socket.on('stats-update', (data) => {
      this.emit('stats-update', data)
    })

    // Evento de actualización de transacciones
    this.socket.on('transaction-update', (data) => {
      this.emit('transaction-update', data)
    })

    // Evento de estadísticas de conexiones
    this.socket.on('connection-stats', (data) => {
      this.emit('connection-stats', data)
    })

    // Evento genérico de notificación
    this.socket.on('notification', (data) => {
      this.emit('notification', data)
    })

    // Respuesta a obtener-estado-completo
    this.socket.on('estado-completo', (data) => {
      this.emit('estado-completo', data)
    })

    // Respuesta a obtener-estadisticas
    this.socket.on('estadisticas', (data) => {
      this.emit('estadisticas', data)
    })

    // Respuesta a unirse-dashboard
    this.socket.on('dashboard-conectado', (data) => {
      console.log('✅ [WS] Dashboard conectado:', data)
      this.emit('dashboard-conectado', data)
    })
  }

  /**
   * Desconectar del servidor
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.isConnected = false
      console.log('🔌 WebSocket desconectado manualmente')
    }
  }

  /**
   * Emitir evento al servidor
   */
  emitToServer(event, data) {
    if (this.socket?.connected) {
      this.socket.emit(event, data)
    } else {
      console.warn(`⚠️ Intentando emitir "${event}" pero WebSocket no está conectado`)
    }
  }

  /**
   * Solicitar estado completo del sistema
   */
  solicitarEstadoCompleto() {
    this.emitToServer('obtener-estado-completo')
  }

  /**
   * Solicitar solo estadísticas
   */
  solicitarEstadisticas() {
    this.emitToServer('obtener-estadisticas')
  }

  /**
   * Unirse al dashboard de administración
   */
  unirseDashboard() {
    this.emitToServer('unirse-dashboard')
  }

  /**
   * Suscribirse a un evento
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event).push(callback)

    // Si el socket ya existe, también escuchar directamente
    if (this.socket) {
      this.socket.on(event, callback)
    }
  }

  /**
   * Desuscribirse de un evento
   */
  off(event, callback) {
    const listeners = this.listeners.get(event)
    if (listeners) {
      const index = listeners.indexOf(callback)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }

    if (this.socket) {
      this.socket.off(event, callback)
    }
  }

  /**
   * Emitir evento interno a listeners locales
   */
  emit(eventName, data) {
    const listeners = this.listeners.get(eventName) || []
    listeners.forEach(callback => {
      try {
        callback(data)
      } catch (error) {
        console.error(`Error en listener de "${eventName}":`, error)
      }
    })
  }

  /**
   * Obtener estado de conexión
   */
  getConnectionState() {
    return {
      isConnected: this.isConnected,
      socketId: this.socket?.id || null,
    }
  }
}

// Crear instancia singleton
const webSocketService = new WebSocketService()

export default webSocketService
