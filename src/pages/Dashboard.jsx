import { useState, useEffect } from 'react'
import { getStatsGlobales, getConnectionStats } from '../services/api'
import webSocketService from '../services/websocket'
import Card from '../components/ui/Card'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import './Dashboard.css'

function Dashboard() {
  const [stats, setStats] = useState(null)
  const [connectionStats, setConnectionStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [wsConnected, setWsConnected] = useState(false)

  useEffect(() => {
    // Cargar datos iniciales
    loadData()

    // Conectar WebSocket
    if (webSocketService.getConnectionState().isConnected) {
      webSocketService.unirseDashboard()
      setWsConnected(true)
    } else {
      webSocketService.connect()
      webSocketService.on('connected', () => {
        webSocketService.unirseDashboard()
        setWsConnected(true)
      })
    }

    // Listener para actualizaciones de estado en tiempo real
    const handleEstadoActualizado = (estado) => {
      console.log('🔄 [Dashboard] Actualización en tiempo real recibida:', estado)
      console.log('🔄 [Dashboard] Estadísticas recibidas:', estado?.estadisticas)
      
      if (estado?.estadisticas) {
        const nuevasStats = {
          conexiones: {
            totalConexiones: estado.estadisticas.totalConexiones || 0,
            jugadoresConectados: estado.estadisticas.jugadoresConectados || 0,
            cajerosConectados: estado.estadisticas.cajerosConectados || 0,
          },
          detalles: {
            cajerosDisponibles: estado.estadisticas.cajerosDisponibles || 0,
            cajerosOcupados: estado.estadisticas.cajerosOcupados || 0,
            transaccionesActivas: estado.estadisticas.transaccionesActivas || 0,
          },
        }
        
        console.log('🔄 [Dashboard] Actualizando connectionStats con:', nuevasStats)
        setConnectionStats(prev => ({
          ...prev,
          ...nuevasStats,
        }))
        
        // También recargar estadísticas globales para asegurar sincronización
        console.log('🔄 [Dashboard] Recargando datos completos...')
        loadData()
      } else {
        console.warn('⚠️ [Dashboard] Estado recibido sin estadísticas:', estado)
      }
    }

    // Listener para cuando se conecta al dashboard
    const handleDashboardConectado = (data) => {
      console.log('✅ Conectado al dashboard:', data)
      setWsConnected(true)
      if (data?.estado?.estadisticas) {
        setConnectionStats(prev => ({
          ...prev,
          conexiones: {
            totalConexiones: data.estado.estadisticas.totalConexiones || 0,
            jugadoresConectados: data.estado.estadisticas.jugadoresConectados || 0,
            cajerosConectados: data.estado.estadisticas.cajerosConectados || 0,
          },
          detalles: {
            cajerosDisponibles: data.estado.estadisticas.cajerosDisponibles || 0,
            cajerosOcupados: data.estado.estadisticas.cajerosOcupados || 0,
            transaccionesActivas: data.estado.estadisticas.transaccionesActivas || 0,
          },
        }))
        // Recargar datos para sincronizar
        loadData()
      }
    }

    // Actualizar estado de conexión
    const handleConnected = () => {
      setWsConnected(true)
      // La autenticación y unirse al dashboard se hace automáticamente en websocket.js
    }

    // Manejar autenticación exitosa
    const handleAuthenticated = (data) => {
      console.log('✅ [Dashboard] Autenticación exitosa:', data)
      // El servicio WebSocket se unirá automáticamente al dashboard después de autenticarse
    }

    // Manejar error de autenticación
    const handleAuthError = (error) => {
      console.error('❌ [Dashboard] Error de autenticación:', error)
      setWsConnected(false)
    }

    // Registrar listeners
    webSocketService.on('estado-actualizado', handleEstadoActualizado)
    webSocketService.on('dashboard-conectado', handleDashboardConectado)
    webSocketService.on('connected', handleConnected)
    webSocketService.on('authenticated', handleAuthenticated)
    webSocketService.on('auth-error', handleAuthError)
    webSocketService.on('disconnected', () => setWsConnected(false))

    // Polling de respaldo cada 30 segundos si WebSocket no está conectado
    const pollingInterval = setInterval(() => {
      if (!webSocketService.getConnectionState().isConnected) {
        loadData()
      }
    }, 30000)

    // Limpieza
    return () => {
      webSocketService.off('estado-actualizado', handleEstadoActualizado)
      webSocketService.off('dashboard-conectado', handleDashboardConectado)
      webSocketService.off('connected', handleConnected)
      webSocketService.off('authenticated', handleAuthenticated)
      webSocketService.off('auth-error', handleAuthError)
      clearInterval(pollingInterval)
    }
  }, [])

  const loadData = async () => {
    try {
      setError(null)
      const [statsData, connectionData] = await Promise.all([
        getStatsGlobales(),
        getConnectionStats().catch(() => null), // Si falla, continuar sin datos de conexión
      ])
      
      setStats(statsData)
      setConnectionStats(connectionData)
    } catch (err) {
      console.error('Error cargando datos:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: 'VES',
      minimumFractionDigits: 2,
    }).format(amount / 100)
  }

  if (loading) {
    return (
      <div className="dashboard-loading">
        <LoadingSpinner />
        <p>Cargando estadísticas...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <p>❌ Error: {error}</p>
        <button onClick={loadData} className="btn-primary">
          Reintentar
        </button>
      </div>
    )
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <div className="ws-status">
          <span className={`ws-indicator ${wsConnected ? 'ws-connected' : 'ws-disconnected'}`}>
            {wsConnected ? '🟢' : '🔴'}
          </span>
          <span className="ws-text">
            {wsConnected ? 'Tiempo real activo' : 'Tiempo real desconectado'}
          </span>
        </div>
      </div>
      
      <div className="dashboard-grid">
        <Card title="Total Jugadores" value={stats?.jugadores || 0} icon="👥" />
        <Card title="Total Cajeros" value={stats?.cajeros || 0} icon="🏦" />
        <Card 
          title="Jugadores Conectados" 
          value={connectionStats?.conexiones?.jugadoresConectados || 0} 
          icon="🟢"
          highlight={connectionStats?.conexiones?.jugadoresConectados > 0}
        />
        <Card 
          title="Cajeros Conectados" 
          value={connectionStats?.conexiones?.cajerosConectados || 0} 
          icon="🟢"
          highlight={connectionStats?.conexiones?.cajerosConectados > 0}
        />
        <Card title="Total Salas" value={stats?.salas || 0} icon="🎮" />
        <Card 
          title="Balance del Sistema" 
          value={formatCurrency(stats?.balance || 0)} 
          icon="💰"
          highlight={stats?.balance > 0}
        />
      </div>

      {connectionStats && (
        <div className="connection-details">
          <h2>Estado del Sistema</h2>
          <div className="connection-stats">
            <div className="stat-item">
              <span className="stat-label">Total Conexiones:</span>
              <span className="stat-value">{connectionStats.conexiones?.totalConexiones || 0}</span>
            </div>
            {connectionStats.detalles && (
              <>
                <div className="stat-item">
                  <span className="stat-label">Cajeros Disponibles:</span>
                  <span className="stat-value">{connectionStats.detalles.cajerosDisponibles || 0}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Cajeros Ocupados:</span>
                  <span className="stat-value">{connectionStats.detalles.cajerosOcupados || 0}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Transacciones Activas:</span>
                  <span className="stat-value">{connectionStats.detalles.transaccionesActivas || 0}</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
