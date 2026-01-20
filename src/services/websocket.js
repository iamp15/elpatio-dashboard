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
    this.isConnecting = false // Flag para evitar múltiples conexiones simultáneas
    this.isAuthenticating = false // Flag para evitar múltiples autenticaciones
  }

  /**
   * Conectar al servidor WebSocket
   */
  connect() {
    // Si ya está conectado, no hacer nada
    if (this.socket?.connected) {
      console.log('✅ [WS] Ya hay una conexión activa, reutilizando...')
      return
    }

    // Si ya está en proceso de conexión, no crear otra
    if (this.isConnecting) {
      console.log('⏳ [WS] Ya hay una conexión en progreso, esperando...')
      return
    }

    const token = getToken()
    if (!token) {
      console.warn('⚠️ No hay token, no se puede conectar al WebSocket')
      return
    }

    // Desconectar socket anterior si existe
    if (this.socket) {
      console.log('🔄 [WS] Cerrando conexión anterior...')
      this.socket.disconnect()
      this.socket = null
    }

    // Marcar como en proceso de conexión
    this.isConnecting = true
    this.isAuthenticating = false

    console.log(`🔗 [WS] Conectando a ${WS_BASE_URL}...`)

    this.socket = io(WS_BASE_URL, {
      query: {
        token,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
      autoConnect: true,
    })

    // Configurar listeners DESPUÉS de crear el socket
    this.setupEventListeners()

    // Listener para resultado de autenticación
    this.socket.on('auth-result', (data) => {
      console.log('🔐 [WS] Resultado de autenticación:', data)
      // Resetear flag de autenticación
      this.isAuthenticating = false
      
      if (data.success) {
        console.log('✅ [WS] Autenticación exitosa como:', data.user?.rol || data.userType)
        // Después de autenticarse, unirse al dashboard (solo una vez)
        if (this.socket?.connected && this.socket.id) {
          console.log('🔗 [WS] Uniéndose al dashboard...')
          this.socket.emit('unirse-dashboard')
        }
        this.emit('authenticated', data)
      } else {
        console.error('❌ [WS] Error en autenticación:', data.message)
        this.emit('auth-error', data)
      }
    })
    
    // Evento de sesión reemplazada
    this.socket.on('session-replaced', (data) => {
      console.log('⚠️ [WS] Sesión reemplazada:', data)
      this.isConnected = false
      this.isConnecting = false
      this.isAuthenticating = false
      this.emit('session-replaced', data)
    })

    this.socket.on('connect', () => {
      const socketId = this.socket.id
      console.log(`✅ [WS] Conectado (socket.id: ${socketId})`)
      this.isConnected = true
      this.isConnecting = false // Ya no está en proceso de conexión
      
      // Autenticarse automáticamente si no está en proceso de autenticación
      if (!this.isAuthenticating) {
        const token = getToken()
        if (token) {
          console.log('🔐 [WS] Autenticando como admin...')
          this.isAuthenticating = true
          this.socket.emit('auth-cajero', { token })
        } else {
          console.warn('⚠️ [WS] No hay token para autenticación')
        }
      }
      
      this.emit('connected', { socketId })
    })

    this.socket.on('disconnect', (reason) => {
      console.log(`❌ [WS] Desconectado: ${reason}`)
      this.isConnected = false
      this.isConnecting = false
      this.isAuthenticating = false
      this.emit('disconnected', { reason })
    })

    this.socket.on('connect_error', (error) => {
      console.error('❌ [WS] Error de conexión:', error.message)
      this.isConnected = false
      this.isConnecting = false
      this.emit('error', { error: error.message })
    })

    this.socket.on('error', (error) => {
      console.error('❌ [WS] Error:', error)
      this.emit('error', { error: error.message || error })
    })
  }

  /**
   * Configurar listeners para eventos del servidor
   */
  setupEventListeners() {
    if (!this.socket) {
      console.warn('⚠️ [WS] No hay socket para configurar listeners')
      return
    }

    // Evento de actualización de estado completo (emitido al room admin-dashboard)
    this.socket.on('estado-actualizado', (data) => {
      console.log('📊 [WS] Estado actualizado recibido')
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
      console.log('🔌 [WS] Desconectando...')
      this.socket.disconnect()
      this.socket = null
    }
    // Resetear todos los estados
    this.isConnected = false
    this.isConnecting = false
    this.isAuthenticating = false
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
   * Suscribirse a un evento interno
   * NOTA: Los eventos se reciben via setupEventListeners() que llama a emit()
   * NO registrar directamente en el socket para evitar duplicación
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    
    // Evitar duplicados - verificar si el callback ya está registrado
    const listeners = this.listeners.get(event)
    if (!listeners.includes(callback)) {
      listeners.push(callback)
    }
    
    // NO registrar en this.socket.on() - ya está manejado por setupEventListeners()
    // que llama a this.emit() para notificar a los listeners internos
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
    // NO necesitamos remover de this.socket porque nunca lo registramos ahí
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
