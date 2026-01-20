/**
 * Hook para gestionar la conexión WebSocket del dashboard
 */

import { useState, useEffect, useRef } from 'react'
import webSocketService from '../services/websocket'
import { getConnectionStats } from '../services/api'

/**
 * Calcula el número de cajeros conectados
 * @param {Object} estadisticas - Objeto con estadísticas
 * @returns {number} Número total de cajeros conectados
 */
function calcularCajerosConectados(estadisticas) {
  return (estadisticas?.cajerosDisponibles || 0) + (estadisticas?.cajerosOcupados || 0)
}

/**
 * Hook para gestionar conexión WebSocket y actualizaciones en tiempo real
 * @param {Function} onLoadData - Callback para recargar datos
 * @returns {Object} Estado de conexión y estadísticas de conexión
 */
export function useWebSocketConnection(onLoadData) {
  const [wsConnected, setWsConnected] = useState(false)
  const [connectionStats, setConnectionStats] = useState(null)
  const listenersRegistered = useRef(false)

  useEffect(() => {
    // Cargar datos iniciales de conexión desde API
    const loadInitialConnectionStats = async () => {
      try {
        const data = await getConnectionStats()
        if (data) {
          setConnectionStats(data)
        }
      } catch (err) {
        // Si falla, continuar sin datos de conexión iniciales
        console.warn('No se pudieron cargar estadísticas de conexión iniciales:', err)
      }
    }
    
    loadInitialConnectionStats()
  }, [])

  useEffect(() => {
    // Evitar registrar listeners múltiples veces (React StrictMode monta 2 veces)
    if (listenersRegistered.current) {
      return
    }
    listenersRegistered.current = true
    
    // Conectar WebSocket si no está conectado
    // NOTA: unirseDashboard() se llama automáticamente después de autenticarse en websocket.js
    if (!webSocketService.getConnectionState().isConnected) {
      webSocketService.connect()
    }
    
    // Actualizar estado inicial de conexión
    setWsConnected(webSocketService.getConnectionState().isConnected)

    // Listener para actualizaciones de estado en tiempo real
    const handleEstadoActualizado = (estado) => {
      console.log('🔄 [Dashboard] Actualización en tiempo real recibida:', estado)
      console.log('🔄 [Dashboard] Estadísticas recibidas:', estado?.estadisticas)
      
      if (estado?.estadisticas) {
        const cajerosConectados = calcularCajerosConectados(estado.estadisticas)
        
        const nuevasStats = {
          conexiones: {
            totalConexiones: estado.estadisticas.totalConexiones || 0,
            jugadoresConectados: estado.estadisticas.jugadoresConectados || 0,
            cajerosConectados: cajerosConectados,
          },
          detalles: {
            cajerosDisponibles: estado.estadisticas.cajerosDisponibles || 0,
            cajerosOcupados: estado.estadisticas.cajerosOcupados || 0,
            transaccionesActivas: estado.estadisticas.transaccionesActivas || 0,
          },
        }
        
        console.log('🔄 [Dashboard] Actualizando connectionStats con:', nuevasStats)
        setConnectionStats(nuevasStats)
      } else {
        console.warn('⚠️ [Dashboard] Estado recibido sin estadísticas:', estado)
      }
    }

    // Listener para cuando se conecta al dashboard
    const handleDashboardConectado = (data) => {
      console.log('✅ Conectado al dashboard:', data)
      setWsConnected(true)
      if (data?.estado?.estadisticas) {
        const cajerosConectados = calcularCajerosConectados(data.estado.estadisticas)
        
        setConnectionStats({
          conexiones: {
            totalConexiones: data.estado.estadisticas.totalConexiones || 0,
            jugadoresConectados: data.estado.estadisticas.jugadoresConectados || 0,
            cajerosConectados: cajerosConectados,
          },
          detalles: {
            cajerosDisponibles: data.estado.estadisticas.cajerosDisponibles || 0,
            cajerosOcupados: data.estado.estadisticas.cajerosOcupados || 0,
            transaccionesActivas: data.estado.estadisticas.transaccionesActivas || 0,
          },
        })
      }
    }

    // Actualizar estado de conexión
    const handleConnected = () => {
      setWsConnected(true)
    }

    // Manejar autenticación exitosa
    const handleAuthenticated = (data) => {
      console.log('✅ [Dashboard] Autenticación exitosa:', data)
    }

    // Manejar error de autenticación
    const handleAuthError = (error) => {
      console.error('❌ [Dashboard] Error de autenticación:', error)
      setWsConnected(false)
    }

    // Handler para desconexión
    const handleDisconnected = () => setWsConnected(false)

    // Registrar listeners
    webSocketService.on('estado-actualizado', handleEstadoActualizado)
    webSocketService.on('dashboard-conectado', handleDashboardConectado)
    webSocketService.on('connected', handleConnected)
    webSocketService.on('authenticated', handleAuthenticated)
    webSocketService.on('auth-error', handleAuthError)
    webSocketService.on('disconnected', handleDisconnected)

    // Polling de respaldo cada 30 segundos si WebSocket no está conectado
    const pollingInterval = setInterval(() => {
      if (!webSocketService.getConnectionState().isConnected) {
        onLoadData()
        // También recargar connectionStats desde API
        getConnectionStats()
          .then(data => {
            if (data) {
              setConnectionStats(data)
            }
          })
          .catch(err => {
            console.warn('Error recargando connectionStats:', err)
          })
      }
    }, 30000)

    // Limpieza - IMPORTANTE: remover todos los listeners al desmontar
    return () => {
      listenersRegistered.current = false
      webSocketService.off('estado-actualizado', handleEstadoActualizado)
      webSocketService.off('dashboard-conectado', handleDashboardConectado)
      webSocketService.off('connected', handleConnected)
      webSocketService.off('authenticated', handleAuthenticated)
      webSocketService.off('auth-error', handleAuthError)
      webSocketService.off('disconnected', handleDisconnected)
      clearInterval(pollingInterval)
    }
  }, [onLoadData])

  return {
    wsConnected,
    connectionStats,
  }
}
