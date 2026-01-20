/**
 * Componente para mostrar los detalles de conexión del sistema
 * @param {Object} connectionStats - Estadísticas de conexión
 */
function ConnectionDetails({ connectionStats }) {
  if (!connectionStats) {
    return null
  }

  return (
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
  )
}

export default ConnectionDetails
