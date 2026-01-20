import { useCallback } from 'react'
import { useDashboardStats } from '../hooks/useDashboardStats'
import { useWebSocketConnection } from '../hooks/useWebSocketConnection'
import DashboardHeader from '../components/dashboard/DashboardHeader'
import DashboardStats from '../components/dashboard/DashboardStats'
import ConnectionDetails from '../components/dashboard/ConnectionDetails'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import Button from '../components/ui/Button'
import './Dashboard.css'

function Dashboard() {
  const { stats, loading, error, loadData } = useDashboardStats()
  
  const handleLoadData = useCallback(() => {
    loadData()
  }, [loadData])
  
  const { wsConnected, connectionStats } = useWebSocketConnection(handleLoadData)

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
      <DashboardHeader wsConnected={wsConnected} />
      <DashboardStats stats={stats} connectionStats={connectionStats} />
      <ConnectionDetails connectionStats={connectionStats} />
    </div>
  )
}

export default Dashboard
