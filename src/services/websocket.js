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

    this.socket = io(WS_BASE_URL, {
      auth: {
        token,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    this.socket.on('connect', () => {
      console.log('✅ WebSocket conectado:', this.socket.id)
      this.isConnected = true
      this.emit('connected', { socketId: this.socket.id })
    })

    this.socket.on('disconnect', (reason) => {
      console.log('❌ WebSocket desconectado:', reason)
      this.isConnected = false
      this.emit('disconnected', { reason })
    })

    this.socket.on('connect_error', (error) => {
      console.error('❌ Error conectando WebSocket:', error)
      this.emit('error', { error: error.message })
    })

    // Escuchar eventos del servidor
    this.setupEventListeners()
  }

  /**
   * Configurar listeners para eventos del servidor
   */
  setupEventListeners() {
    if (!this.socket) return

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
