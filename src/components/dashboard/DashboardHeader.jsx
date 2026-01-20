/**
 * Componente para el header del dashboard
 * @param {boolean} wsConnected - Indica si WebSocket está conectado
 */
function DashboardHeader({ wsConnected }) {
  return (
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
  )
}

export default DashboardHeader
