import { useState, useEffect } from 'react'
import { getStatsGlobales, getConnectionStats } from '../services/api'
import Card from '../components/ui/Card'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import './Dashboard.css'

function Dashboard() {
  const [stats, setStats] = useState(null)
  const [connectionStats, setConnectionStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadData()
    
    // Actualizar cada 30 segundos
    const interval = setInterval(loadData, 30000)
    
    return () => clearInterval(interval)
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
      <h1>Dashboard</h1>
      
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
