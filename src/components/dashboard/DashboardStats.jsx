/**
 * Componente para mostrar las estadísticas del dashboard en forma de cards
 */

import Card from '../ui/Card'
import { formatCurrency } from '../../utils/formatters'

/**
 * Componente para mostrar estadísticas en cards
 * @param {Object} stats - Estadísticas globales
 * @param {Object} connectionStats - Estadísticas de conexión
 */
function DashboardStats({ stats, connectionStats }) {
  return (
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
  )
}

export default DashboardStats
