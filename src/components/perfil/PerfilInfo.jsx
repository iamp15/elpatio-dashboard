/**
 * Componente para mostrar la información básica del perfil
 */

import Badge from '../ui/Badge'
import Card from '../ui/Card'
import { formatRole, getRoleBadgeVariant, formatDate } from '../../utils/formatters'

/**
 * Componente para mostrar información del perfil
 * @param {Object} perfil - Información del admin desde el backend
 */
function PerfilInfo({ perfil }) {
  if (!perfil) {
    return (
      <div className="perfil-error">
        <p>No se pudo cargar la información del usuario</p>
      </div>
    )
  }

  // Obtener las iniciales del nombre completo
  const getInitials = (nombreCompleto) => {
    if (!nombreCompleto) return '?'
    const nombres = nombreCompleto.split(' ')
    if (nombres.length >= 2) {
      return `${nombres[0].charAt(0)}${nombres[1].charAt(0)}`.toUpperCase()
    }
    return nombreCompleto.charAt(0).toUpperCase()
  }

  // Determinar el badge de estado
  const getEstadoBadgeVariant = (estado) => {
    switch (estado) {
      case 'activo':
        return 'success'
      case 'inactivo':
        return 'danger'
      default:
        return 'default'
    }
  }

  return (
    <div className="perfil-info-container">
      <Card>
        <div className="perfil-card-content">
          <div className="perfil-avatar">
            <div className="avatar-circle">
              {getInitials(perfil.nombreCompleto)}
            </div>
            <h2 className="perfil-nombre">{perfil.nombreCompleto}</h2>
          </div>
          
          <div className="perfil-details">
            <div className="perfil-detail-item">
              <label className="perfil-label">Email:</label>
              <span className="perfil-value">{perfil.email}</span>
            </div>
            
            <div className="perfil-detail-item">
              <label className="perfil-label">ID:</label>
              <span className="perfil-value perfil-value-mono">{perfil._id}</span>
            </div>
            
            <div className="perfil-detail-item">
              <label className="perfil-label">Rol:</label>
              <Badge variant={getRoleBadgeVariant(perfil.rol)}>
                {formatRole(perfil.rol)}
              </Badge>
            </div>

            <div className="perfil-detail-item">
              <label className="perfil-label">Estado:</label>
              <Badge variant={getEstadoBadgeVariant(perfil.estado)}>
                {perfil.estado === 'activo' ? 'Activo' : 'Inactivo'}
              </Badge>
            </div>

            {perfil.fechaCreacion && (
              <div className="perfil-detail-item">
                <label className="perfil-label">Miembro desde:</label>
                <span className="perfil-value">
                  {formatDate(perfil.fechaCreacion)}
                </span>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}

export default PerfilInfo
